import { Module } from '@nestjs/common';

import { ClientSessionsController } from './client-sessions.controller';
import { ClientSessionsService } from './client-sessions.service';

@Module({
    controllers: [ClientSessionsController],
    providers: [ClientSessionsService],
    exports: [ClientSessionsService],
})
export class ClientSessionsModule {}
