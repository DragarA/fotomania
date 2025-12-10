import { Module } from '@nestjs/common';

import { PublicController } from './public.controller';
import { CataloguesModule } from '../catalogues/catalogues.module';
import { PhotosModule } from '../photos/photos.module';
import { ClientSessionsModule } from '../client-sessions/client-sessions.module';

@Module({
  imports: [CataloguesModule, PhotosModule, ClientSessionsModule],
  controllers: [PublicController],
})
export class PublicModule {}
