import ClientAPI from '../../client/ClientAPI';
import Loop, { LoopStatus } from './loop';
import { SharedAudioContextContents } from '../../contexts/SharedAudioContext';
import { TimeSettings } from '../../contexts/ClockContext';
import { v4 as uuid } from 'uuid';
import { OffsetedBlob } from '../loopRecorder';
import { LoopProgress } from './loopBuffer';

class NetworkedLoop {
  private readonly loop: Loop;
  private readonly id: string;
  private readonly api?: ClientAPI;

  constructor(audio: SharedAudioContextContents, time: TimeSettings, api?: ClientAPI) {
    this.api = api;
    this.id = uuid();
    const onCreateLoop = (startAt: number, nPackets: number): void => {
      if (api) {
        api.audio.create({
          ...time,
          loopID: this.id,
          startAt,
          nPackets,
        });
      }
    };

    const onAddBlob = (blob: OffsetedBlob): void => {
      if (api) {
        blob.blob.arrayBuffer().then((buff) => {
          api.audio.set({
            loopID: this.id,
            packet: blob.idx,
            file: new Uint8Array(buff),
            meta: {
              head: blob.head,
              length: blob.length,
            },
          });
        });
      }
    };

    this.loop = new Loop(audio, time, {
      onCreateLoop,
      onAddBlob,
    });
  }

  public start(): void {
    const startTime = this.loop.start();
    if (this.api) {
      this.api.audio.play({
        loopID: this.id,
        startTime,
      });
    }
  }

  public stop(): void {
    this.loop.stop();
    if (this.api) this.api.audio.stop(this.id);
  }

  public getPreview(): Float32Array {
    return this.loop.buffer.preview;
  }

  public getStatus(): LoopStatus {
    return this.loop.status;
  }

  public getProgress(): LoopProgress {
    return this.loop.buffer.getProgress();
  }
}

export default NetworkedLoop;
