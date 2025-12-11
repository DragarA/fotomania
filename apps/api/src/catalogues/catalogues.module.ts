import { Module } from '@nestjs/common';
import { CataloguesService } from './catalogues.service';
import { CataloguesController } from './catalogues.controller';
import { CollectionsModule } from '../collections/collections.module';

@Module({
  controllers: [CataloguesController],
  providers: [CataloguesService],
  exports: [CataloguesService],
  imports: [CollectionsModule],
})
export class CataloguesModule {}
