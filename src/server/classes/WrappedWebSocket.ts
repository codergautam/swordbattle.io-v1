import { WebSocket } from 'uWebSockets.js';

class WrappedWebSocket extends WebSocket {
  public joinedAt: number | undefined;
}
