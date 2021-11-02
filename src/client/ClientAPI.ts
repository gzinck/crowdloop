import { io } from 'socket.io-client';
import AudioAPI from './AudioAPI';
import ClockAPI from './ClockAPI';
import SessionAPI from './SessionAPI';

const serverURL = 'ws://localhost:2000';

class ClientAPI {
  public readonly audio: AudioAPI;
  public readonly sessionID: string;
  private readonly session: SessionAPI;
  private readonly clock: ClockAPI;

  constructor(ctx: AudioContext, sessionID: string) {
    const socket = io(serverURL);
    this.sessionID = sessionID;
    this.audio = new AudioAPI(socket, sessionID);
    this.session = new SessionAPI(socket, sessionID);
    this.clock = new ClockAPI(socket, ctx, sessionID);

    this.session.createSession();
  }

  public cleanup(): void {
    this.session.deleteSession();
    this.clock.cleanup();
  }
}

export default ClientAPI;
