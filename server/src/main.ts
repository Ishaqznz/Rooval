import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalGraphQLExceptionFilter } from './infra/graphQL/filters/graphql-exception.filter';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import * as express from 'express';

async function bootstrap() {

  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`,
          ),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });
  const configService = app.get(ConfigService);

  app.use(
    '/webhook/stripe',
    express.raw({ type: 'application/json' })
  );
  
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }));

  app.use((req: express.Request, res: express.Response, next) => {
    if (req.originalUrl.startsWith('/graphql') && req.headers['content-type']?.includes('multipart/form-data')) {
      return next();
    }
    express.json({ limit: '10mb' })(req, res, next);
  });

  const CLIENT_URL = configService.get<string>('FRONT_END_URL');
  console.log('the client url: ', CLIENT_URL)
  app.enableCors({
    origin: CLIENT_URL,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalGraphQLExceptionFilter());
  const PORT = configService.get<number>('PORT');
  app.use(cookieParser());
  await app.listen(PORT);
}
bootstrap();
