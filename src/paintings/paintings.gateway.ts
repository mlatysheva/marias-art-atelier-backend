/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.authService.verifyToken(client.handshake.auth.Authentication.value);
    } catch (error) {
      console.error('Unauthorized connection attempt', error);
      throw new WsException('Unauthorized');
    }
  }
}
