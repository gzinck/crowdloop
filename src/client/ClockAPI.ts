import { Socket } from 'socket.io-client';
import * as events from './events';

interface PingReq {
  startTime: number;
}

class ClockAPI {
  private readonly sessionID: string;
  private readonly io: Socket;
  public readonly cleanup: () => void;

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
    this.cleanup = () => io.removeAllListeners(events.CLOCK_PING);
  }
}

export default ClockAPI;
