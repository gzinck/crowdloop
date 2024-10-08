import { Socket } from 'socket.io-client';
import * as events from './events';

interface PingReq {
  startTime: number;
  deltas?: number[];
}

class ClockAPI {
  private readonly sessionID: string;
  private readonly io: Socket;

  constructor(io: Socket, ctx: AudioContext, sessionID: string) {
    this.sessionID = sessionID;
    this.io = io;

    io.on(events.CLOCK_PING, (req: PingReq) => {
      io.emit(events.CLOCK_HOST_PONG, {
        ...req,
        sessionID: this.sessionID,
        clientTime: ctx.currentTime * 1000, // convert to ms
      });
    });
  }

  public sync(): void {
    this.io.emit(events.CLOCK_GET);
  }

  public cleanup(): void {
    this.io.removeAllListeners(events.CLOCK_PING);
  }
}

export default ClockAPI;
