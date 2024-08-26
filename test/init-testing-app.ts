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
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { RoleType } from '@src/common/constants/role-type';
import { JwtService } from '@nestjs/jwt';
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

export async function getService(service) {
  return await app.get(service);
}

export async function createDataMock(data = [], entity) {
  const repo = await app.get(getRepositoryToken(entity));
  return await repo.save(data.map((item) => repo.create(item)));
}

export function createRandomUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const password = 'password';
  const username = faker.internet.userName();
  const role = faker.helpers.enumValue(RoleType);
  return {
    email,
    password,
    username,
    role,
  };
}

export async function getToken(data) {
  const jwtService = await getService(JwtService);
  return jwtService.sign(data);
}
