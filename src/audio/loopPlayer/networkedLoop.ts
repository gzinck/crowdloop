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

/**
 * Gets timestamp for a time representing the number of seconds
 * since the beginning of an audio context. Timestamp is in seconds.
 * @param time s since start of the ctx
 * @param ctx the audio context used for time
 */
const getTimestamp = (time: number, ctx: AudioContext): number => {
  console.log(Date.now(), ctx.currentTime, time);
  return Date.now() / 1000 - ctx.currentTime + time;
};

class NetworkedLoop {
  private readonly loop: Loop;
  public readonly id: string;
  private readonly api?: ClientAPI;
  private readonly audio: SharedAudioContextContents;
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
    this.audio = audio;
    this.dimensions = dims || defaultDims;
    this.id = uuid();
    const onCreateLoop = (nPackets: number, localStartAt?: number): void => {
      // Get the time
      const startAt = localStartAt ? getTimestamp(localStartAt, audio.ctx) : 0;
      console.log('It will start at', startAt);

      this.nPackets = nPackets;
      if (api) {
        api.audio.create({
          ...time,
          ...this.dimensions,
          loopID: this.id,
          startAt,
          nPackets,
          isStopped: localStartAt === undefined,
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
    const localStartTime = this.loop.start();
    const startTime = getTimestamp(localStartTime, this.audio.ctx);

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
