import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CataloguesModule } from './catalogues/catalogues.module';
import { ClientSessionsModule } from './client-sessions/client-sessions.module';
import { CollectionsModule } from './collections/collections.module';
import { AuthModule } from './common/auth/auth.module';
import { DbModule } from './common/db/db.module';
import { I18nConfigModule } from './i18n/i18n.module';
import { PhotosModule } from './photos/photos.module';
import { PublicModule } from './public/public.module';
import { UsersModule } from './users/users.module';
import { validateEnv } from './config/env.validation';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validate: validateEnv,
        }),
        I18nConfigModule,
        DbModule,
        AuthModule,
        UsersModule,
        CataloguesModule,
        ClientSessionsModule,
        CollectionsModule,
        PhotosModule,
        PublicModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
