import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from '@src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '@src/modules/auth/token.entity';
import { User } from '@src/modules/user/user.entity';
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

  return app.init();
}

export async function getService(service) {
  return await app.get(service);
}

export async function createDataMock(data = [], entity) {
  const repo = await app.get(getRepositoryToken(entity));
  return await repo.save(data.map((item) => repo.create(item)));
}

export async function getToken(
  user: User,
): Promise<{ token: string; refreshToken: string }> {
  const tokenData = { id: user.id, username: user.username };
  const jwtService = await getService(JwtService);
  const [token, refreshToken] = [
    jwtService.sign(tokenData),
    jwtService.sign(tokenData, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRED || '14d',
    }),
  ];
  const newToken = {
    token,
    refreshToken,
    userId: user.id,
    expToken: jwtService.decode(token).exp,
    expRefreshToken: jwtService.decode(refreshToken).exp,
  } as Partial<Tokens>;
  createDataMock([newToken], Tokens);
  return { token, refreshToken };
}
