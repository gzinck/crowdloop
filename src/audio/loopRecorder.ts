import { Observable, Subject, throwError, timer } from 'rxjs';
import { TimeSettings } from '../components/ClockContext';
import { getLoopLength, getSecondsUntilStart } from '../utils/beats';
import { SharedAudioContextContents } from './SharedAudioContext';

export const recordingSchedulingTime = 0.05; // time before recording (s) at which time we should start scheduling because timing is imprecise
export const recordingHead = 0.1;
export const defaultTail = 0.1;
export const defaultMicDelay = 0.35; // delay for MacBook Air internal mic

interface ScheduledRecording {
  startTime: number; // in s
  idx: number;
  curRecorder: MediaRecorder;
  nxtRecorder: MediaRecorder;
}

export interface OffsetedBlob {
  // The actual audio file in blob format
  blob: Blob;
  // seconds before the actual start that the recording begins
  head: number;
  // seconds in the actual desired part of the recording
  length: number;
  // index of the blob in the recording
  idx: number;
}

export class LoopRecorder {
  private readonly ctx: AudioContext;
  private readonly recorder1: MediaRecorder;
  private readonly recorder2: MediaRecorder;
  private isLocked = false;

  constructor(ctx: AudioContext, micStream: MediaStream) {
    this.ctx = ctx;
    this.recorder1 = new MediaRecorder(micStream, {
      mimeType: 'audio/webm',
      // audioBitsPerSecond: 128000,
    });
    this.recorder2 = new MediaRecorder(micStream, {
      mimeType: 'audio/webm',
      // audioBitsPerSecond: 128000,
    });
  }

  public getIsLocked(): boolean {
    return this.isLocked;
  }

  public record(
    startTime: number, // when the recording should start (not considering heads)
    totalLength: number, // combined length of the blobs starting at startTime
    nBlobs: number, // number of recordings
    head: number = recordingHead, // desired head size for each blob (defaults to 0.1s)
    tail: number = defaultTail, // desired tail size for each blob (defaults to 0.1s)
  ): Observable<OffsetedBlob> {
    if (this.isLocked) {
      return throwError(() => new Error('recording attempted when locked'));
    }
    this.isLocked = true;

    const length = totalLength / nBlobs;
    const blobs$ = new Subject<OffsetedBlob>();

    const scheduled$ = new Subject<ScheduledRecording>();
    scheduled$.subscribe((scheduled) => {
      const curTime = this.ctx.currentTime;
      const curHead = scheduled.startTime - curTime;
      let actualHead = 0;
      const curTimestamp = performance.now();
      let startTime = 0;
      // When actually start, record the time using the timestamp of the start event
      scheduled.curRecorder.onstart = (event) => {
        startTime = event.timeStamp;
        // This is the amount of the recording to skip at the start
        actualHead = curHead - (event.timeStamp - curTimestamp) / 1000;
      };

      scheduled.curRecorder.onstop = (event) => {
        console.log('Length of recording: ', event.timeStamp - startTime);
        console.log('Event timestamp:', event.timeStamp, ', Curr timestamp:', performance.now());
        console.log('Head:', actualHead, ', length:', length, ', tail:', tail);
      };

      scheduled.curRecorder.ondataavailable = (event) => {
        console.log('WOOOO', event);
        blobs$.next({
          blob: event.data,
          head: actualHead,
          length,
          idx: scheduled.idx,
        });

        // If this is the last recording, finish the stream and unlock
        if (scheduled.idx === nBlobs - 1) {
          blobs$.complete();
          this.isLocked = false;
          scheduled$.complete();
        }
      };

      scheduled.curRecorder.start();

      // After curHead + length, end this recording
      timer((curHead + length + tail) * 1000).subscribe(() => {
        scheduled.curRecorder.stop();
      });

      // Start the next one if we're not at the very last
      if (scheduled.idx + 1 < nBlobs) {
        const nextStartTime = scheduled.startTime + length;
        timer((nextStartTime - curTime - head - recordingSchedulingTime) * 1000).subscribe(() => {
          scheduled$.next({
            startTime: nextStartTime,
            idx: scheduled.idx + 1,
            // Swap recorders
            curRecorder: scheduled.nxtRecorder,
            nxtRecorder: scheduled.curRecorder,
          });
        });
      }
    });
    console.log(
      'First recording',
      (startTime - this.ctx.currentTime - head - recordingSchedulingTime) * 1000,
    );

    // Schedule the first recording
    timer((startTime - this.ctx.currentTime - head - recordingSchedulingTime) * 1000).subscribe(
      () => {
        scheduled$.next({
          startTime,
          idx: 0,
          curRecorder: this.recorder1,
          nxtRecorder: this.recorder2,
        });
      },
    );

    return blobs$;
  }
}

/**
 * Records a sequence of audio files in the form of Blobs.
 * @param time settings for the loop's time
 * @param audio audio context with the audio recorders. Note that the recorder1 and recorder2
 * must be instantiated before calling this function
 * @param head the number of seconds before and after the MP3 to record
 * @param numBlobs the number of separate audio files to send back in Blob format
 * @param micDelay the number of seconds late the mic audio arrives for recording
 * @param offset$ a channel to send back the number of seconds the recording started before it
 * was supposed to (MediaRecorder cannot be synced with the audio context for its start time as
 * of 2021). If the number is positive (it should be), this should be the offset in playback for
 * the first recording.
 * For those wondering what this crazy design pattern is, it mirrors standards for GoLang.
 * @returns Observable of webm blobs with the recorded audio. There are 2--4 separate webm files
 * produced before completion
 */
const recordLoop = (
  time: TimeSettings,
  audio: SharedAudioContextContents,
  numBlobs: number,
  micDelay: number = defaultMicDelay,
  head: number = recordingHead,
  tail: number = defaultTail,
): Observable<OffsetedBlob> => {
  if (!audio.recorder1 || !audio.recorder2) {
    return throwError(() => new Error('recorders were not initialized prior to recording'));
  }

  if (audio.recorder1.getIsLocked() && audio.recorder2.getIsLocked()) {
    return throwError(
      () => new Error('both LoopRecorders are locked, so another recording cannot be created yet'),
    );
  }

  const startTime =
    getSecondsUntilStart(time, audio, Math.max(head + recordingSchedulingTime + micDelay, 0)) +
    audio.ctx.currentTime;
  const length = getLoopLength(time);
  const rec: LoopRecorder = !audio.recorder1.getIsLocked() ? audio.recorder1 : audio.recorder2;

  return rec.record(startTime + micDelay, length, numBlobs, head, tail);
};

export default recordLoop;
