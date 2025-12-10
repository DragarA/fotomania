import { Module } from '@nestjs/common';
import { ClientSessionsService } from './client-sessions.service';

@Module({
  providers: [ClientSessionsService],
  exports: [ClientSessionsService],
})
export class ClientSessionsModule {}
