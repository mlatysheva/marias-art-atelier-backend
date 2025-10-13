import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PaintingsGateway {
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  private readonly server: Server;

  handlePaintingUpdated() {
    this.server.emit('Painting updated');
  }

  handleConnection(client: Socket) {
    try {
      const handshakeAuth = client.handshake.auth as Record<string, unknown>;
      const authentication = handshakeAuth.Authentication;

      let token: string | undefined;

      if (typeof authentication === 'string') {
        token = authentication;
      } else if (
        authentication &&
        typeof authentication === 'object' &&
        'value' in authentication &&
        typeof (authentication as { value?: unknown }).value === 'string'
      ) {
        token = (authentication as { value: string }).value;
      }

      if (!token) {
        throw new WsException('Unauthorized');
      }

      this.authService.verifyToken(token);
    } catch (error) {
      console.error('Unauthorized connection attempt', error);
      throw new WsException('Unauthorized');
    }
  }
}
