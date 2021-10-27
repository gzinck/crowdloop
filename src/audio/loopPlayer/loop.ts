import { timer } from 'rxjs';
import { TimeSettings } from '../../components/ClockContext';
import { getLoopLength, getSecondsUntilStart } from '../../utils/beats';
import { RecordingEventType, recordingHead, recordingSchedulingTime } from '../loopRecorder';
import { SharedAudioContextContents } from '../SharedAudioContext';
import LoopBuffer from './loopBuffer';

export enum LoopStatus {
  PLAYING = 'PLAYING',
  STOPPED = 'STOPPED',
  RECORDING = 'RECORDING',
  PENDING = 'PENDING',
}

class Loop {
  public readonly buffer: LoopBuffer;
  public readonly time: TimeSettings;
  public status: LoopStatus = LoopStatus.PENDING;

  constructor(audio: SharedAudioContextContents, time: TimeSettings) {
    if (!audio.recorder)
      throw new Error(
        'must set up a mic stream and create a RecordingManager before creating a loop',
      );

    this.time = time;

    const numBlobs = getLoopLength(time) > 4 ? 4 : 2;
    this.buffer = new LoopBuffer(audio, time, numBlobs);

    // Start recording at the next round
    audio.recorder.recordLoop(time, numBlobs, audio.micDelay).subscribe({
      next: (event) => {
        if (event.type === RecordingEventType.SUCCESS) {
          this.buffer.addBlob(event.recording).then(() => {
            if (event.recording.idx === 0) this.buffer.start();
          });
        } else {
          this.status = LoopStatus.RECORDING;
        }
      },
      complete: () => (this.status = LoopStatus.PLAYING),
    });
  }

  stop(): void {
    this.buffer.stop();
    this.status = LoopStatus.STOPPED;
  }

  start(): void {
    this.buffer.start();
    this.status = LoopStatus.PLAYING;
  }
}

export default Loop;
