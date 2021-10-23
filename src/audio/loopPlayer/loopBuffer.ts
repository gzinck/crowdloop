import { Subject, timer } from "rxjs";
import { TimeSettings } from "../../components/ClockContext";
import { getSecondsUntilStart } from "../../utils/beats";
import { SharedAudioContextContents } from "../SharedAudioContext";

const previewSize = 100;
const schedulingTime = 0.05; // time in s before loop start at which point we should start scheduling things

interface AudioStartEvent {
  idx: number;
  startTime: number; // time in s in the AudioContext when audio should start
  curGainNode: GainNode;
  prvGainNode: GainNode;
}

interface LoopProgress {
  normalized: number; // in [0, 1)
  time: number; // curr time in the loop
  beats: number; // current beat in the loop (float)
}

// VISUAL MODEL OF HOW A LOOP BUFFER WORKS:
//
// |--------|------|----------------------------------|------|
// | Offset | Head | Main recording                   | Tail |
// |--------|------|----------------------------------|------|
// |----------------------|----------|----------|------------|
// | Buffer 1             | Buffer 2 | Buffer 3 | Buffer 4   |
// |----------------------|----------|----------|------------|
//
// When played, the main recording of one instance should be directly adjacent to the
// main recording of another instance.

class LoopBuffer {
  private readonly buffers: (AudioBuffer | null)[];
  public readonly preview: Float32Array = new Float32Array(previewSize).fill(0);
  private readonly time: TimeSettings;
  private readonly head: number;
  private readonly audio: SharedAudioContextContents;
  private gainNode1: GainNode;
  private gainNode2: GainNode;
  private stopped: boolean = false;
  // offset for playback caused because of timing issues with recording.
  // js does not time the start of MediaRecorder properly, so we start recording
  // before the actual recording is supposed to begin
  private offset: number = 0;

  /**
   *
   * @param audio the audio context to use when adding buffers and starting loop
   * @param ms duration of the main loop
   * @param head amount of time before the main loop starts (fade-in time in s)
   * @param tail amount of time after the main loop ends (fade-out time in s)
   * @param nBuffers the number of separate audio files in the loop
   */
  constructor(
    audio: SharedAudioContextContents,
    time: TimeSettings,
    head: number,
    nBuffers: number
  ) {
    this.audio = audio;
    this.time = time;
    this.head = head;
    this.buffers = new Array(nBuffers).fill(null);

    // Gain nodes handle the fade in and out
    this.gainNode1 = audio.ctx.createGain();
    this.gainNode1.gain.value = 0;
    this.gainNode1.connect(audio.ctx.destination);

    this.gainNode2 = audio.ctx.createGain();
    this.gainNode2.gain.value = 0;
    this.gainNode2.connect(audio.ctx.destination);
  }

  public setOffset(offset: number) {
    this.offset = offset;
  }

  public addBlob(blob: Blob, idx: number) {
    if (idx < 0 || idx >= this.buffers.length) {
      throw new Error("tried to add an audio buffer out of range: " + idx);
    }

    blob.arrayBuffer().then((buff) => {
      this.audio.ctx.decodeAudioData(buff, (audioBuffer) => {
        this.buffers[idx] = audioBuffer;
        const floats = audioBuffer.getChannelData(0);

        // add this blob to the preview
        // @TODO: improve this preview when considering the head/tail
        const buffPreviewSize = previewSize / this.buffers.length;
        const startIdx = buffPreviewSize * idx;
        for (let i = startIdx; i < startIdx + buffPreviewSize; i++) {
          const j = Math.floor(
            (i - startIdx) * (floats.length / buffPreviewSize)
          );
          this.preview[i] = floats[j];
        }
      });
    });
  }

  /**
   * Stops the loop (if it was previously started)
   */
  public stop() {
    this.stopped = true;
  }

  public start() {
    this.stopped = false;
    const events$ = new Subject<AudioStartEvent>();

    const startLoop = (curGainNode: GainNode, prvGainNode: GainNode) => {
      const secondsUntilNxtStart = getSecondsUntilStart(
        this.time,
        this.audio,
        schedulingTime + this.head
      );
      const nxtStartTime =
        this.audio.ctx.currentTime + secondsUntilNxtStart - this.head;

      timer(
        (secondsUntilNxtStart - schedulingTime - this.head) * 1000
      ).subscribe(() => {
        events$.next({
          idx: 0,
          startTime: nxtStartTime,
          curGainNode,
          prvGainNode,
        });
      });
    };

    // NOTE: startTime ALWAYS refers to when the main part of the loop starts,
    // diregarding the head and the offset (if applicable).

    const sub = events$.subscribe(
      ({ idx, startTime, curGainNode, prvGainNode }) => {
        const buffer = this.buffers[idx];
        if (buffer === null) {
          // If the buffer is currently empty, bring volume to zero before we were supposed to start
          curGainNode.gain.setValueAtTime(1, this.audio.ctx.currentTime);
          curGainNode.gain.linearRampToValueAtTime(0, startTime);
          // Restart the loop at the next iteration
          startLoop(curGainNode, prvGainNode);
          return;
        }

        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(curGainNode);

        if (idx === 0) {
          // Fade out old loop
          prvGainNode.gain.setValueAtTime(1, this.audio.ctx.currentTime);
          prvGainNode.gain.linearRampToValueAtTime(0, startTime);

          if (!this.stopped) {
            // Fade in new loop
            curGainNode.gain.setValueAtTime(0, this.audio.ctx.currentTime);
            curGainNode.gain.linearRampToValueAtTime(1, startTime);

            source.start(startTime - this.head, this.offset);

            // Start the next one when this one is over
            // Subtract the offset because that's where we start in the buffer
            // Subtract a tiny delta because there's a blip in the audio otherwise
            const timeUntilNext =
              source.buffer.length / this.audio.ctx.sampleRate -
              this.offset -
              0.00001; // in s
            timer(timeUntilNext * 1000).subscribe(() => {
              const nextIdx = (idx + 1) % this.buffers.length;
              events$.next({
                idx: nextIdx,
                startTime: timeUntilNext + startTime,
                curGainNode,
                prvGainNode,
              });
            });
          } else {
            sub.unsubscribe();
          }
        } else if (idx === this.buffers.length - 1) {
          // Start the loop
          source.start(startTime - this.head);

          // Restart the loop when it is appropriate and swap gain nodes
          startLoop(prvGainNode, curGainNode);
        } else {
          // No fade out, just start the loop right off
          source.start(startTime - this.head);

          // Start the next one when this one is over
          const timeUntilNext =
            source.buffer.length / this.audio.ctx.sampleRate; // in s
          timer(timeUntilNext * 1000).subscribe(() => {
            const nextIdx = (idx + 1) % this.buffers.length;
            events$.next({
              idx: nextIdx,
              startTime: timeUntilNext + startTime,
              curGainNode,
              prvGainNode,
            });
          });
        }
      }
    );

    startLoop(this.gainNode1, this.gainNode2);
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
