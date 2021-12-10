import { Subject, Subscription, timer } from 'rxjs';
import { TimeSettings } from '../../contexts/ClockContext';
import { getLoopLength, getSecondsUntilStart } from '../../utils/beats';
import { OffsetedBlob } from '../loopRecorder';
import { SharedAudioContextContents } from '../../contexts/SharedAudioContext';
import { recordingHead } from '../loopRecorder';
import { limiterLookaheadDelay } from '../constants';

// Some notes: we will ALWAYS start and schedule loops early by 5ms
// (or whatever limiterLookaheadDelay is) because we need to be able to
// look ahead to void clipping.
//
// We will always start an audio file early by its head length, which makes it
// possible to fade the audio in. The gain will go from 0 to 100 from the time
// [start time - head length - limiter lookahead] to [start time - limiter lookahead].
//
// We will always schedule a change to occur 50ms in advance because
// timing is not guaranteed in JS. This is represented by schedulingTime and
// does not affect the actual start times of the loops. It just affects when
// we schedule the future start time.
// Note that we could do without this and just do everythign in advance.

const previewSize = 200;
const schedulingTime = 0.05; // time in s before loop start at which point we should start scheduling things
const stopTime = 0.05; // time to stop the audio if needed ASAP

interface AudioStartEvent {
  idx: number;
  startTime: number; // time in s in the AudioContext when audio should start
  curGainNode: GainNode;
  prvGainNode: GainNode;
}

interface OffsetedBuffer {
  // A decoded AudioBuffer
  buff: AudioBuffer;
  // seconds before the actual start that the recording begins
  head: number;
  // seconds in the actual desired part of the recording
  length: number;
}

export interface LoopProgress {
  normalized: number; // in [0, 1)
  time: number; // curr time in the loop
  beats: number; // current beat in the loop (float)
}

// VISUAL MODEL OF HOW A LOOP BUFFER WORKS:
//
// |------|--------------------------------|------|
// | Head | Main recording                 | Tail |
// |------|--------------------------------|------|
// | B1H  | Buffer 1 | B1T  |---------------------|
// |----------| B2H  | Buffer 2 | B2T  |----------|
// |---------------------| B3H  | Buffer 3 | B3T  |
//
// When played, the main recording of one instance should be directly adjacent to the
// main recording of another instance.

class LoopBuffer {
  private readonly buffers: (OffsetedBuffer | null)[];
  private readonly heads: number[];
  public readonly rawPreview: Float32Array = new Float32Array(previewSize).fill(0);
  public preview: Float32Array;
  private readonly time: TimeSettings;
  private readonly audio: SharedAudioContextContents;
  private playSubscription?: Subscription;
  private gainNode1: GainNode;
  private gainNode2: GainNode;
  private mainGainNode: GainNode;
  private stopped = false;

  /**
   *
   * @param audio the audio context to use when adding buffers and starting loop
   * @param ms duration of the main loop
   * @param head amount of time before the main loop starts (fade-in time in s)
   * @param tail amount of time after the main loop ends (fade-out time in s)
   * @param nBuffers the number of separate audio files in the loop
   */
  constructor(audio: SharedAudioContextContents, time: TimeSettings, nBuffers: number) {
    this.preview = this.rawPreview; // For now, preview is unscaled
    this.audio = audio;
    this.time = time;
    this.buffers = new Array(nBuffers).fill(null);
    this.heads = new Array(nBuffers).fill(0);

    // Gain nodes handle the fade in and out
    // Main gain is for the emergency stops
    this.mainGainNode = audio.ctx.createGain();
    this.mainGainNode.gain.value = 0;
    this.mainGainNode.connect(audio.destination);

    // Other gain is for fading in/out pieces of the audio file
    this.gainNode1 = audio.ctx.createGain();
    this.gainNode1.gain.value = 0;
    this.gainNode1.connect(this.mainGainNode);

    this.gainNode2 = audio.ctx.createGain();
    this.gainNode2.gain.value = 0;
    this.gainNode2.connect(this.mainGainNode);
  }

  public addBlob({ blob, idx, length, head }: OffsetedBlob): Promise<void> {
    if (idx < 0 || idx >= this.buffers.length) {
      throw new Error(`tried to add an audio buffer out of range: ${idx}`);
    }

    return blob.arrayBuffer().then((buff) => {
      this.audio.ctx.decodeAudioData(buff, (audioBuffer) => {
        this.buffers[idx] = {
          buff: audioBuffer,
          length,
          head,
        };
        const floats = audioBuffer.getChannelData(0);

        // create a preview by sampling the floats
        const destSize = previewSize / this.buffers.length;
        const destStart = destSize * idx;

        const sourceSize = audioBuffer.sampleRate * length;
        const sourceStart = Math.floor(audioBuffer.sampleRate * head);

        for (let destPos = destStart; destPos < destStart + destSize; destPos++) {
          const sourcePos =
            Math.floor((destPos - destStart) * (sourceSize / destSize)) + sourceStart;
          this.rawPreview[destPos] = floats[sourcePos];
        }

        if (!this.buffers.includes(null)) {
          // Normalize the preview values to [0, 1]
          const minVal = this.rawPreview.reduce((curMin, cur) => Math.min(curMin, cur), 0);
          const maxVal = this.rawPreview.reduce((curMax, cur) => Math.max(curMax, cur), 0);
          this.preview = this.rawPreview.map((val) => (val - minVal) / (maxVal - minVal));
        }
      });
    });
  }

  /**
   * Stops the loop (if it was previously started)
   */
  public stop(): void {
    this.stopped = true;
    this.mainGainNode.gain.setValueAtTime(1, this.audio.ctx.currentTime);
    this.mainGainNode.gain.linearRampToValueAtTime(0, this.audio.ctx.currentTime + stopTime);
    this.playSubscription?.unsubscribe();
  }

  /**
   *
   * @returns start time of the loop
   */
  public start(): number {
    if (this.playSubscription) this.playSubscription.unsubscribe();

    this.stopped = false;
    const events$ = new Subject<AudioStartEvent>();
    const loopLength = getLoopLength(this.time);
    // Assumption: all buffers are the same size.
    // Could just use the buffers' lengths, but what if not all buffers are loaded yet?
    const buffLength = loopLength / this.buffers.length;

    // NOTE: startTime ALWAYS refers to when the main part of the loop starts,
    // diregarding the head and the limiter lookahead

    this.playSubscription = events$.subscribe(({ idx, startTime, curGainNode, prvGainNode }) => {
      const buffer = this.buffers[idx];

      // Schedule the next change right away
      const nxtIdx = (idx + 1) % this.buffers.length;
      const nxtHead = this.buffers[nxtIdx]?.head || recordingHead;
      const nxtStartTime =
        nxtIdx === 0
          ? // if this is the start of the loop, to avoid drift with floating point,
            // manually calculate the audio start
            getSecondsUntilStart(this.time, this.audio) + this.audio.ctx.currentTime
          : // otherwise, just get it the lazy way
            startTime + buffLength;

      const timeUntilNext =
        nxtStartTime -
        this.audio.ctx.currentTime -
        nxtHead -
        schedulingTime -
        limiterLookaheadDelay;
      timer(timeUntilNext * 1000).subscribe(() => {
        events$.next({
          idx: nxtIdx,
          startTime: nxtStartTime,
          curGainNode: prvGainNode,
          prvGainNode: curGainNode,
        });
      });

      // Swap the gain nodes
      let fadeInTime = startTime - (buffer?.head || recordingHead) - limiterLookaheadDelay;
      let offset: number | undefined = undefined;
      if (fadeInTime < this.audio.ctx.currentTime) {
        offset = this.audio.ctx.currentTime - fadeInTime;
        fadeInTime = this.audio.ctx.currentTime;
      }

      // Immediately swap gain nodes if start time is passed, otherwise go slowly
      if (fadeInTime >= startTime) {
        prvGainNode.gain.setValueAtTime(0, fadeInTime);
        curGainNode.gain.setValueAtTime(1, fadeInTime);
      } else {
        prvGainNode.gain.setValueAtTime(1, fadeInTime);
        prvGainNode.gain.linearRampToValueAtTime(0, startTime);

        curGainNode.gain.setValueAtTime(0, fadeInTime);
        curGainNode.gain.linearRampToValueAtTime(1, startTime);
      }

      // Also make sure the main gain is up
      this.mainGainNode.gain.setValueAtTime(1, fadeInTime);

      // If the buffer is empty, simply wait until the next buffer begins
      // (already scheduled)
      if (buffer === null) {
        console.error(`buffer was null in position: ${idx}`);
        return;
      }

      // Create our new buffer source
      const source = this.audio.ctx.createBufferSource();
      source.buffer = buffer.buff;
      source.connect(curGainNode);

      if (!this.stopped) source.start(fadeInTime, offset);
    });

    // Schedule the first buffer
    const firstHead = this.buffers[0]?.head || recordingHead;
    const timeUntilFirst = getSecondsUntilStart(
      this.time,
      this.audio,
      schedulingTime + limiterLookaheadDelay,
    );
    const firstStartTime = timeUntilFirst + this.audio.ctx.currentTime;

    timer((timeUntilFirst - firstHead - schedulingTime - limiterLookaheadDelay) * 1000).subscribe(
      () => {
        events$.next({
          idx: 0,
          startTime: firstStartTime,
          curGainNode: this.gainNode1,
          prvGainNode: this.gainNode2,
        });
      },
    );

    return firstStartTime;
  }

  public getProgress(): LoopProgress {
    const deltaTime = this.audio.ctx.currentTime - this.audio.startTime; // in s
    const beatsSinceStart = deltaTime * (this.time.bpm / 60);
    const nBeats = this.time.bpbar * this.time.nBars;
    const beats = beatsSinceStart % nBeats;
    return {
      normalized: beats / nBeats,
      time: beats / (this.time.bpm / 60),
      beats,
    };
  }
}

export default LoopBuffer;
