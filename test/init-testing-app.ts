import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from '@src/app.module';

let app: INestApplication;

export async function initTest(): Promise<INestApplication> {
  initializeTransactionalContext();
  // Init PostgreSqlContainer
  const defaultDB = 'postgres_test';
  const container = await new PostgreSqlContainer()
    .withDatabase(defaultDB)
    .withUsername(defaultDB)
    .withPassword(defaultDB)
    .start();
  // Set config env
  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = container.getPort().toString();
  process.env.DB_DATABASE = container.getDatabase();
  process.env.DB_USERNAME = defaultDB;
  process.env.DB_PASSWORD = defaultDB;

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => {
        const msg = errors
          .map((error) => Object.values(error.constraints))
          .flat();
        return new BadRequestException(msg);
      },
    }),
  );

  return app.init();
}
