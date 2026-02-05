import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Serve static files from uploads directory
    app.useStaticAssets(resolve('./uploads'), {
        prefix: '/uploads',
    });

    const configService = app.get(ConfigService);
    const frontendUrl =
        configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    // Enable CORS for frontend
    app.enableCors({
        origin: [frontendUrl],
        credentials: true,
    });

    // Swagger/OpenAPI configuration
    const config = new DocumentBuilder()
        .setTitle('Fotomania API')
        .setDescription('The Fotomania API documentation')
        .setVersion('1.0')
        .addTag('app')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth'
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    // Write OpenAPI spec to file on startup (skip in production)
    if (process.env.NODE_ENV !== 'production') {
        const openApiPath = resolve(__dirname, '../openapi.json');
        writeFileSync(openApiPath, JSON.stringify(document, null, 2));
        logger.log(`OpenAPI spec written to: ${openApiPath}`);
    }

    // Expose OpenAPI spec as JSON endpoint
    app.getHttpAdapter().get('/api-json', (_req: any, res: any) => {
        res.json(document);
    });

    const port =
        configService.get<number>('PORT') ||
        configService.get<number>('API_PORT') ||
        3000;
    const apiBaseUrl =
        configService.get<string>('API_BASE_URL') || `http://localhost:${port}`;

    await app.listen(port);
    logger.log(`Application is running on: ${apiBaseUrl}`);
    logger.log(`API Documentation: ${apiBaseUrl}/api-docs`);
    logger.log(`OpenAPI JSON: ${apiBaseUrl}/api-json`);
}

bootstrap();
