// api/src/events/events.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({ cors: { origin: '*' } }) // Allow all origins for simplicity in dev
  export class EventsGateway {
    @WebSocketServer()
    server: Server;
  
    // Method to send a message to all connected clients
    sendToAll(event: string, data: any) {
      this.server.emit(event, data);
    }
  }