import { mergeMap, Observable, Subject, tap, throwError, timer } from "rxjs";
import { TimeSettings } from "../components/ClockContext";
import { getLoopLength, getSecondsUntilStart } from "../utils/beats";
import { SharedAudioContextContents } from "./SharedAudioContext";

const schedulingTime = 0.05; // time before recording (s) at which time we should start scheduling because timing is imprecise

// @TODO: do we need to add a fade-in and fade-out time?

// Records audio using recursion, passing back a stream of MP3s as it goes.
// If depth of recursion is high, must refactor this.
/**
 *
 * @param curRecorder the recorder to record with immediately
 * @param nxtRecorder the recorder to record with after the current recording is done
 * @param length number of seconds per recording
 * @param times the number of recordings to create
 * @returns stream of MP3 blobs for playback
 */
const recordRecursively = (
  curRecorder: MediaRecorder,
  nxtRecorder: MediaRecorder,
  length: number,
  times: number
): Observable<Blob> => {
  return new Observable<Blob>((sub) => {
    if (times <= 0) sub.complete();
    if (curRecorder.state === "recording") {
      throw new Error("curRecorder was recording when it should be free");
    }

    curRecorder.ondataavailable = (event) => {
      sub.next(event.data);
      if (times === 1) sub.complete();
    };
    curRecorder.start();

    setTimeout(() => {
      curRecorder.stop(); // Trigger the data to be compiled into a blob
      if (times > 1) {
        recordRecursively(
          nxtRecorder,
          curRecorder,
          length,
          times - 1
        ).subscribe({
          next: (value) => sub.next(value),
          complete: () => sub.complete(),
        });
      }
    }, length * 1000);
  });
};

export class LoopRecorder {
  private readonly node: MediaStreamAudioSourceNode;
  private readonly recorder1: MediaRecorder;
  private readonly recorder2: MediaRecorder;
  private isLocked: boolean = false;
  constructor(audio: SharedAudioContextContents) {
    if (!audio.micStream)
      throw new Error(
        "mic stream was not present, so could not instantiate the LoopRecorder"
      );

    this.node = audio.ctx.createMediaStreamSource(audio.micStream);
    this.recorder1 = new MediaRecorder(audio.micStream, {
      mimeType: "audio/webm",
      audioBitsPerSecond: 128000,
    });
    this.recorder2 = new MediaRecorder(audio.micStream, {
      mimeType: "audio/webm",
      audioBitsPerSecond: 128000,
    });
  }

  public isRecording(): boolean {
    return (
      this.isLocked ||
      this.recorder1.state === "recording" ||
      this.recorder2.state === "recording"
    );
  }

  // Ensures nobody else uses it until we start recording
  public lock(): void {
    console.log("LOCKED");
    this.isLocked = true;
  }

  // Gets an MP3 recording for the time given (in seconds)
  public recordFor(length: number, numBlobs: number): Observable<Blob> {
    if (
      this.recorder1.state === "recording" ||
      this.recorder2.state === "recording"
    ) {
      return throwError(
        () =>
          new Error("recording was in progress, so recording could not begin")
      );
    }

    // Start recording
    this.isLocked = false;
    return recordRecursively(
      this.recorder1,
      this.recorder2,
      length / numBlobs,
      numBlobs
    );
  }
}

/**
 * Records a sequence of audio files in the form of Blobs.
 * @param time settings for the loop's time
 * @param audio audio context with the audio recorders. Note that the recorder1 and recorder2
 * must be instantiated before calling this function
 * @param head the number of seconds before and after the MP3 to record
 * @param numBlobs the number of separate audio files to send back in Blob format
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
  head: number,
  numBlobs: number,
  offset$: Subject<number>
): Observable<Blob> => {
  if (!audio.recorder1 || !audio.recorder2) {
    return throwError(
      () => new Error("recorders were not initialized prior to recording")
    );
  }

  if (audio.recorder1.isRecording() && audio.recorder2.isRecording()) {
    return throwError(
      () =>
        new Error(
          "both LoopRecorders are already recording, so another recording cannot be created yet"
        )
    );
  }

  const startAt = getSecondsUntilStart(time, audio, head + schedulingTime) - head - schedulingTime;
  const length = getLoopLength(time) + 2 * head; // time before and after loop
  const rec: LoopRecorder = !audio.recorder1.isRecording()
    ? audio.recorder1
    : audio.recorder2;

  rec.lock();
  return timer(startAt * 1000).pipe(
    tap(() => {
      // Figure out how far from the start we are—
      const shouldStartIn = getSecondsUntilStart(time, audio, 0) - head;
      offset$.next(shouldStartIn);
      offset$.complete();
    }),
    mergeMap(() => rec.recordFor(length, numBlobs))
    );
};

export default recordLoop;
