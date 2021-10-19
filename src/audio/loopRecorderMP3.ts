import { Observable, throwError } from "rxjs";
import { SharedAudioContextContents } from "./SharedAudioContext";

// Records audio using recursion, passing back a stream of MP3s as it goes.
// If depth of recursion is high, must refactor this.
/**
 *
 * @param curRecorder the recorder to record with immediately
 * @param nxtRecorder the recorder to record with after the current recording is done
 * @param ms number of ms per recording
 * @param times the number of recordings to create
 * @returns stream of MP3 blobs for playback
 */
const recordRecursively = (
  curRecorder: MediaRecorder,
  nxtRecorder: MediaRecorder,
  ms: number,
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
        recordRecursively(nxtRecorder, curRecorder, ms, times - 1).subscribe({
          next: (value) => sub.next(value),
          complete: () => sub.complete(),
        });
      }
    }, ms);
  });
};

export class LoopRecorder {
  private readonly node: MediaStreamAudioSourceNode;
  private readonly recorder1: MediaRecorder;
  private readonly recorder2: MediaRecorder;
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
      this.recorder1.state === "recording" ||
      this.recorder2.state === "recording"
    );
  }

  // Gets an MP3 recording for the time given
  public recordFor(ms: number): Observable<Blob> {
    if (this.isRecording()) {
      return throwError(
        () =>
          new Error("recording was in progress, so recording could not begin")
      );
    }

    // Start recording
    const numBlobs = ms >= 4000 ? 4 : 2;
    return recordRecursively(
      this.recorder1,
      this.recorder2,
      ms / numBlobs,
      numBlobs
    );
  }
}

/**
 *
 * @param audio audio context with the audio recorders. Note that the recorder1 and recorder2
 * must be instantiated before calling this function
 * @param ms number of ms to record in the loop
 * @returns Observable of webm blobs with the recorded audio. There are 2--4 separate webm files
 * produced before completion
 */
const recordMP3Loop = (
  audio: SharedAudioContextContents,
  ms: number
): Observable<Blob> => {
  if (!audio.recorder1 || !audio.recorder2) {
    return throwError(
      () => new Error("recorders were not initialized prior to recording")
    );
  }

  if (!audio.recorder1.isRecording()) return audio.recorder1.recordFor(ms);
  else if (!audio.recorder2.isRecording()) return audio.recorder2.recordFor(ms);
  else
    return throwError(
      () =>
        new Error(
          "both LoopRecorders are already recording, so another recording cannot be created yet"
        )
    );
};

export default recordMP3Loop;
