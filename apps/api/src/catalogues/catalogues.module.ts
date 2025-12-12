import { Module } from '@nestjs/common';

import { CollectionsModule } from '../collections/collections.module';

import { CataloguesController } from './catalogues.controller';
import { CataloguesService } from './catalogues.service';

@Module({
    controllers: [CataloguesController],
    providers: [CataloguesService],
    exports: [CataloguesService],
    imports: [CollectionsModule],
})
export class CataloguesModule {}
