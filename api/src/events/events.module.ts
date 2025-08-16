// api/src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway], // Export it so other modules can use it
})
export class EventsModule {}