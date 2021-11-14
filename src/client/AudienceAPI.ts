import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import * as events from './events';

export interface AudiencePos {
  id: string; // socketID
  x: number; // in [0, 1]
  y: number; // in [0, 1]
}

class AudienceAPI {
  private readonly sessionID: string;
  private readonly io: Socket;
  private readonly positions: Record<string, AudiencePos> = {};
  // Subscribable positions (useful when need to rerender every time)
  public readonly positions$: Observable<Record<string, AudiencePos>>;

  constructor(io: Socket, sessionID: string) {
    this.sessionID = sessionID;
    this.io = io;

    const positions$ = new BehaviorSubject<Record<string, AudiencePos>>(this.positions);
    this.positions$ = positions$;

    this.io.on(events.AUDIENCE_POS_LIST, (positions: AudiencePos[]) => {
      positions.forEach((pos) => {
        this.positions[pos.id] = pos;
      });
      positions$.next({ ...this.positions });
    });

    this.io.on(events.AUDIENCE_POS_SET, (pos: AudiencePos) => {
      this.positions[pos.id] = pos;
      positions$.next({ ...this.positions });
    });

    this.io.on(events.AUDIENCE_DISCONNECT, (id: string) => {
      delete this.positions[id];
      positions$.next({ ...this.positions });
    });
  }

  cleanup(): void {
    this.io.removeAllListeners(events.AUDIENCE_POS_LIST);
    this.io.removeAllListeners(events.AUDIENCE_POS_SET);
    this.io.removeAllListeners(events.AUDIENCE_DISCONNECT);
  }
}

export default AudienceAPI;
