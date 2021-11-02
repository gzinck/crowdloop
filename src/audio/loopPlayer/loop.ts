import { TimeSettings } from '../../contexts/ClockContext';
import { getLoopLength } from '../../utils/beats';
import { OffsetedBlob, RecordingEventType } from '../loopRecorder';
import { SharedAudioContextContents } from '../../contexts/SharedAudioContext';
import LoopBuffer from './loopBuffer';

export enum LoopStatus {
  PLAYING = 'PLAYING',
  STOPPED = 'STOPPED',
  RECORDING = 'RECORDING',
  PENDING = 'PENDING',
}

interface Callbacks {
  onCreateLoop?: (startAt: number, numBlobs: number) => void;
  onAddBlob?: (blob: OffsetedBlob) => void;
}

class Loop {
  public readonly buffer: LoopBuffer;
  public readonly time: TimeSettings;
  public status: LoopStatus = LoopStatus.PENDING;

  constructor(audio: SharedAudioContextContents, time: TimeSettings, cb?: Callbacks) {
    if (!audio.recorder) {
      throw new Error(
        'must set up a mic stream and create a RecordingManager before creating a loop',
      );
    }

    this.time = time;
    const numBlobs = getLoopLength(time) > 4 ? 4 : 2;
    this.buffer = new LoopBuffer(audio, time, numBlobs);

    // Start recording at the next round
    audio.recorder.recordLoop(time, numBlobs, audio.micDelay).subscribe({
      next: (event) => {
        if (event.type === RecordingEventType.SUCCESS) {
          this.buffer.addBlob(event.recording).then(() => {
            if (event.recording.idx === 0) {
              const startAt = this.buffer.start();
              if (cb && cb.onCreateLoop) cb.onCreateLoop(startAt, numBlobs);
            }
            if (cb && cb.onAddBlob) cb.onAddBlob(event.recording);
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

  start(): number {
    this.status = LoopStatus.PLAYING;
    return this.buffer.start();
  }
}

export default Loop;
