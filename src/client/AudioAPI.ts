import { Socket } from 'socket.io-client';
import * as events from './events';

interface CreateAudioReq {
  loopID: string;
  startAt: number;
  nPackets: number;
  bpbar: number; // beats per bar
  bpm: number; // beats per minute
  nBars: number; // number of bars in new loops
  x: number;
  y: number;
  radius: number;
}

interface SetAudioReq {
  loopID: string;
  packet: number;
  file: ArrayBuffer;
  meta: {
    head: number;
    length: number;
  };
}

interface MoveAudioRequest {
  loopID: string;
  x: number;
  y: number;
  radius: number;
}

interface PlayAudioReq {
  loopID: string;
  startTime: number;
}

interface DeleteAudioReq {
  loopID: string;
  nPackets: number;
}

class AudioAPI {
  private readonly sessionID: string;
  private readonly io: Socket;

  constructor(io: Socket, sessionID: string) {
    this.io = io;
    this.sessionID = sessionID;
  }

  public create(req: CreateAudioReq): void {
    this.io.emit(events.AUDIO_CREATE, {
      ...req,
      sessionID: this.sessionID,
    });
  }

  public set(req: SetAudioReq): void {
    this.io.emit(events.AUDIO_SET, {
      ...req,
      sessionID: this.sessionID,
    });
  }

  public move(req: MoveAudioRequest): void {
    this.io.emit(events.AUDIO_MOVE, {
      ...req,
      sessionID: this.sessionID,
    });
  }

  public delete(req: DeleteAudioReq): void {
    this.io.emit(events.AUDIO_DELETE, {
      ...req,
      sessionID: this.sessionID,
    });
  }

  public play(req: PlayAudioReq): void {
    this.io.emit(events.AUDIO_PLAY, {
      ...req,
      sessionID: this.sessionID,
    });
  }

  public stop(loopID: string): void {
    this.io.emit(events.AUDIO_STOP, {
      loopID,
      sessionID: this.sessionID,
    });
  }
}

export default AudioAPI;
