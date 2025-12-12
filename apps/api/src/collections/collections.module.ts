import { Module } from '@nestjs/common';

import { PhotosModule } from '../photos/photos.module';

import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
    controllers: [CollectionsController],
    providers: [CollectionsService],
    exports: [CollectionsService],
    imports: [PhotosModule],
})
export class CollectionsModule {}
