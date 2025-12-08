import { Module } from '@nestjs/common';
import { CataloguesService } from './catalogues.service';
import { CataloguesController } from './catalogues.controller';

@Module({
  controllers: [CataloguesController],
  providers: [CataloguesService],
  exports: [CataloguesService],
})
export class CataloguesModule {}
