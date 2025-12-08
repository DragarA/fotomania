import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import passport from 'passport';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

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
