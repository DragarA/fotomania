import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { PhotosModule } from '../photos/photos.module';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
  imports: [PhotosModule],
})
export class CollectionsModule {}
