import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { json, raw } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, // do not use the default parser
  });
  app.useLogger(app.get(Logger));
  app.use('/checkout/webhook', raw({ type: 'application/json' })); // send Buffer to Stripe /checkout
  app.use(json()); // send JSON to all other routes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js frontend URL
    credentials: true, // allow cookies/auth headers
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.use(cookieParser());
  await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}

void bootstrap().catch((error) => {
  console.error('Bootstrap failed', error);
  process.exit(1);
});
