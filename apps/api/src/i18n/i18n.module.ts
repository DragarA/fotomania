import { Module, Global } from '@nestjs/common';
import { I18nModule as NestI18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

@Global()
@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, 'locales'),
        watch: true,
      },
      resolvers: [
        // Resolve language from Accept-Language header (primary method)
        new AcceptLanguageResolver(),
        // Fallback: resolve from query parameter ?lang=sl
        new QueryResolver(['lang', 'locale']),
        // Fallback: resolve from custom header
        new HeaderResolver(['x-custom-lang']),
      ],
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nConfigModule {}
