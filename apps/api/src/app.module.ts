import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './common/auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbModule } from './common/db/db.module';
import { CataloguesModule } from './catalogues/catalogues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
    AuthModule,
    UsersModule,
    CataloguesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
