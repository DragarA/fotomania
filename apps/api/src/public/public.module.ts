import { Module } from '@nestjs/common';

import { PublicController } from './public.controller';
import { CataloguesModule } from '../catalogues/catalogues.module';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [CataloguesModule, PhotosModule],
  controllers: [PublicController],
})
export class PublicModule {}
