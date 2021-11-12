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
  onCreateLoop?: (umBlobs: number, startAt?: number) => void;
  onAddBlob?: (blob: OffsetedBlob) => void;
}

class Loop {
  public readonly buffer: LoopBuffer;
  public readonly time: TimeSettings;
  public status: LoopStatus;
  public startImmediately = true;

  constructor(
    audio: SharedAudioContextContents,
    time: TimeSettings,
    startImmediately = true,
    cb?: Callbacks,
  ) {
    if (!audio.recorder) {
      throw new Error(
        'must set up a mic stream and create a RecordingManager before creating a loop',
      );
    }

    this.status = LoopStatus.PENDING;
    this.startImmediately = startImmediately;
    this.time = time;
    const numBlobs = getLoopLength(time) > 4 ? 4 : 2;
    this.buffer = new LoopBuffer(audio, time, numBlobs);

    // Start recording at the next round
    audio.recorder.recordLoop(time, numBlobs, audio.micDelay).subscribe({
      next: (event) => {
        if (event.type === RecordingEventType.SUCCESS) {
          this.buffer.addBlob(event.recording).then(() => {
            if (cb && cb.onAddBlob) cb.onAddBlob(event.recording);
          });
        } else {
          this.status = LoopStatus.RECORDING;
          const startAt = this.startImmediately ? this.buffer.start() : undefined;
          if (cb && cb.onCreateLoop) cb.onCreateLoop(numBlobs, startAt);
        }
      },
      complete: () => {
        this.status = this.startImmediately ? LoopStatus.PLAYING : LoopStatus.STOPPED;
      },
    });
  }

  stop(): void {
    this.buffer.stop();
    if ([LoopStatus.PENDING, LoopStatus.RECORDING].includes(this.status)) {
      this.startImmediately = false;
    } else {
      this.status = LoopStatus.STOPPED;
    }
  }

  start(): number {
    if (this.status === LoopStatus.STOPPED) this.status = LoopStatus.PLAYING;
    else this.startImmediately = true;

    return this.buffer.start();
  }
}

export default Loop;
