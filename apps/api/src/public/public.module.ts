import { Module } from '@nestjs/common';

import { CataloguesModule } from '../catalogues/catalogues.module';
import { ClientSessionsModule } from '../client-sessions/client-sessions.module';
import { PhotosModule } from '../photos/photos.module';

import { PublicController } from './public.controller';

@Module({
    imports: [CataloguesModule, PhotosModule, ClientSessionsModule],
    controllers: [PublicController],
})
export class PublicModule {}
