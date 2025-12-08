import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173'],
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

  // Write OpenAPI spec to file on startup
  const openApiPath = resolve(__dirname, '../openapi.json');
  writeFileSync(openApiPath, JSON.stringify(document, null, 2));
  console.log(`✅ OpenAPI spec written to: ${openApiPath}`);

  // Expose OpenAPI spec as JSON endpoint
  app.getHttpAdapter().get('/api-json', (_req, res) => {
    res.json(document);
  });

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('API Documentation: http://localhost:3000/api-docs');
  console.log('OpenAPI JSON: http://localhost:3000/api-json');
}

bootstrap();
