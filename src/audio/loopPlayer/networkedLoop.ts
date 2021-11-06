import ClientAPI from '../../client/ClientAPI';
import Loop, { LoopStatus } from './loop';
import { SharedAudioContextContents } from '../../contexts/SharedAudioContext';
import { TimeSettings } from '../../contexts/ClockContext';
import { v4 as uuid } from 'uuid';
import { OffsetedBlob } from '../loopRecorder';
import { LoopProgress } from './loopBuffer';

export interface CircleDimensions {
  x: number; // normalized to [0, 1]
  y: number; // normalized to [0, 1]
  radius: number; // normalized to [0, 1] (but will probably be much less)
}

const defaultDims: CircleDimensions = { x: 0, y: 0, radius: 0 };

class NetworkedLoop {
  private readonly loop: Loop;
  private readonly id: string;
  private readonly api?: ClientAPI;
  private nPackets = 0;
  public dimensions: CircleDimensions;

  constructor(
    audio: SharedAudioContextContents,
    time: TimeSettings,
    api?: ClientAPI,
    dims?: CircleDimensions,
  ) {
    this.api = api;
    this.dimensions = dims || defaultDims;
    this.id = uuid();
    const onCreateLoop = (startAt: number, nPackets: number): void => {
      this.nPackets = nPackets;
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
            file: buff,
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

  public delete(): void {
    if (this.getStatus() === LoopStatus.PLAYING) this.loop.stop();
    if (this.api) {
      this.api.audio.delete({
        loopID: this.id,
        nPackets: this.nPackets,
      });
    }
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

  public setDimensions(dim: CircleDimensions): void {
    this.dimensions = dim;
    // @TODO: actually send dimensions to the server
  }
}

export default NetworkedLoop;
