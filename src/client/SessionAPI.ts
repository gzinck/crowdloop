import { Socket } from 'socket.io-client';
import * as events from './events';

interface Client {
  id: string;
  x: number; // 0 to 1
  y: number; // 0 to 1
}

class SessionAPI {
  private readonly sessionID: string;
  private readonly io: Socket;
  public readonly clients: Client[];

  constructor(io: Socket, sessionID: string) {
    this.sessionID = sessionID;
    this.io = io;

    // @TODO: get the clients refreshed as we go with a new event that gets
    // emitted!
    this.clients = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 0.25, y: 0.8 },
      { id: 'c', x: 0.65, y: 0.8 },
      { id: 'd', x: 0.95, y: 0.8 },
      { id: 'e', x: 0.95, y: 0.13 },
      { id: 'f', x: 0.91, y: 0.5 },
    ];
  }

  public createSession(): void {
    this.io.emit(events.SESSION_CREATE, this.sessionID);
  }

  public deleteSession(): void {
    this.io.emit(events.SESSION_DELETE, this.sessionID);
  }
}

export default SessionAPI;
