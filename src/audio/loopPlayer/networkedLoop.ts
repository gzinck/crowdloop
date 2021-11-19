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

const defaultDims: CircleDimensions = { x: 0.5, y: 0.5, radius: 1 };

class NetworkedLoop {
  private readonly loop: Loop;
  public readonly id: string;
  private readonly api?: ClientAPI;
  private nPackets = 0;
  public dimensions: CircleDimensions;

  constructor(
    audio: SharedAudioContextContents,
    time: TimeSettings,
    startImmediately = true,
    api?: ClientAPI,
    dims?: CircleDimensions,
  ) {
    this.api = api;
    this.dimensions = dims || defaultDims;
    this.id = uuid();
    const onCreateLoop = (nPackets: number, startAt?: number): void => {
      this.nPackets = nPackets;
      if (api) {
        api.audio.create({
          ...time,
          ...this.dimensions,
          loopID: this.id,
          startAt: startAt || 0,
          nPackets,
          isStopped: startAt === undefined,
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

    this.loop = new Loop(audio, time, startImmediately, {
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
    this.loop.stop();
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

  public willStartImmediately(): boolean {
    return this.loop.startImmediately;
  }

  public getProgress(): LoopProgress {
    return this.loop.buffer.getProgress();
  }

  public setDimensions(dim: CircleDimensions): void {
    this.dimensions = dim;
    if (this.api) {
      this.api.audio.move({
        ...dim,
        loopID: this.id,
      });
    }
  }
}

export default NetworkedLoop;
