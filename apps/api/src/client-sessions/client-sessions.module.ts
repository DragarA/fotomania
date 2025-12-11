import { Module } from '@nestjs/common';
import { ClientSessionsService } from './client-sessions.service';
import { ClientSessionsController } from './client-sessions.controller';

@Module({
  controllers: [ClientSessionsController],
  providers: [ClientSessionsService],
  exports: [ClientSessionsService],
})
export class ClientSessionsModule {}
