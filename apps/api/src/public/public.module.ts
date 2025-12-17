import { Module } from '@nestjs/common';

import { CataloguesModule } from '../catalogues/catalogues.module';
import { ClientSessionsModule } from '../client-sessions/client-sessions.module';
import { PhotosModule } from '../photos/photos.module';

import { DeliveryAccessGuard } from './guards/delivery-access.guard';
import { PublicAccessGuard } from './guards/public-access.guard';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
    imports: [CataloguesModule, PhotosModule, ClientSessionsModule],
    controllers: [PublicController],
    providers: [PublicService, PublicAccessGuard, DeliveryAccessGuard],
})
export class PublicModule {}
