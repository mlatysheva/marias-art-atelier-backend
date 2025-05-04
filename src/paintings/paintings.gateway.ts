import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PaintingsGateway {
  @WebSocketServer()
  private readonly server: Server;

  handlePaintingUpdated() {
    this.server.emit('Painting updated');
  }
}
