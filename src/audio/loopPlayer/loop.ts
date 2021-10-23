import { Subject, timer } from "rxjs";
import { TimeSettings } from "../../components/ClockContext";
import { getLoopLength, getSecondsUntilStart } from "../../utils/beats";
import recordLoop from "../loopRecorder";
import { SharedAudioContextContents } from "../SharedAudioContext";
import LoopBuffer from "./loopBuffer";

const headLength = 0.5;

export enum LoopStatus {
  PLAYING = "PLAYING",
  STOPPED = "STOPPED",
  RECORDING = "RECORDING",
  PENDING = "PENDING",
}

class Loop {
  public readonly buffer: LoopBuffer;
  public readonly time: TimeSettings;
  public status: LoopStatus = LoopStatus.PENDING;

  constructor(audio: SharedAudioContextContents, time: TimeSettings) {
    this.time = time;
    let blobIdx = 0;

    const numBlobs = getLoopLength(time) > 4 ? 4 : 2;
    this.buffer = new LoopBuffer(audio, time, headLength, numBlobs);

    // Get the offset in time for the recording start
    const offset$ = new Subject<number>();
    offset$.subscribe((offset) => this.buffer.setOffset(offset));

    // Start recording at the next round
    recordLoop(time, audio, headLength, numBlobs, offset$).subscribe({
      next: (blob) => {
        this.buffer.addBlob(blob, blobIdx++);
        if (blobIdx === 1) this.buffer.start();
      },
      complete: () => (this.status = LoopStatus.PLAYING),
    });

    // Change status to recording when recording
    const timeToStart = getSecondsUntilStart(time, audio, headLength);
    timer(timeToStart * 1000).subscribe(
      () => (this.status = LoopStatus.RECORDING)
    );
  }
}

export default Loop;
