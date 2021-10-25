import { timer } from "rxjs";
import { TimeSettings } from "../../components/ClockContext";
import { getLoopLength, getSecondsUntilStart } from "../../utils/beats";
import recordLoop, {
  recordingHead,
  recordingSchedulingTime,
} from "../loopRecorder";
import { SharedAudioContextContents } from "../SharedAudioContext";
import LoopBuffer from "./loopBuffer";

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

    const numBlobs = getLoopLength(time) > 4 ? 4 : 2;
    this.buffer = new LoopBuffer(audio, time, numBlobs);

    // Start recording at the next round
    recordLoop(time, audio, numBlobs).subscribe({
      next: (blob) => {
        this.buffer.addBlob(blob).then(() => {
          if (blob.idx === 0) this.buffer.start();
        });
      },
      complete: () => (this.status = LoopStatus.PLAYING),
    });

    // Change status to recording when recording
    const timeToStart = getSecondsUntilStart(
      time,
      audio,
      recordingHead + recordingSchedulingTime
    );
    timer(timeToStart * 1000).subscribe(
      () => (this.status = LoopStatus.RECORDING)
    );
  }
}

export default Loop;
