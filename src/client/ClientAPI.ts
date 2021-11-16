import { io } from 'socket.io-client';
import AudienceAPI from './AudienceAPI';
import AudioAPI from './AudioAPI';
import ClockAPI from './ClockAPI';
import SessionAPI from './SessionAPI';

const URL = 'ws://localhost:2000';

class ClientAPI {
  public readonly audio: AudioAPI;
  public readonly sessionID: string;
  public readonly session: SessionAPI;
  public readonly clock: ClockAPI;
  public readonly audience: AudienceAPI;

  constructor(ctx: AudioContext, sessionID: string) {
    const socket = io(process.env.REACT_APP_SERVER_URL || URL);
    this.sessionID = sessionID;
    this.audio = new AudioAPI(socket, sessionID);
    this.session = new SessionAPI(socket, sessionID);
    this.clock = new ClockAPI(socket, ctx, sessionID);
    this.audience = new AudienceAPI(socket, sessionID);

    this.session.createSession();
  }

  public cleanup(): void {
    this.session.deleteSession();
    this.clock.cleanup();
    this.audience.cleanup();
  }
}

export default ClientAPI;
