import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { initTest } from './init-testing-app';
import { faker } from '@faker-js/faker';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const gql = '/graphql';
  // Init mock data
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const password = 'password';
  const username = faker.internet.userName();

  beforeAll(async () => {
    app = await initTest();
  });
  afterAll(() => app.close());

  describe('registerUser', () => {
    it('fail with missing password', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
            mutation Register {
                register(
                    registerUserInput: { email: "${email}", username: "${username}" }
                ) {
                    username
                    email
                }
            }
            `,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.errors[0].statusCode).toEqual(400);
        });
    });

    it('fail with format password', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
            mutation Register {
                register(
                    registerUserInput: { email: "${email}",password: "123", username: "${username}" }
                ) {
                    username
                    email
                }
            }
            `,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.errors[0].statusCode).toEqual(400);
        });
    });

    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
            mutation Register {
                register(
                    registerUserInput: { email: "${email}", password: "${password}", username: "${username}" }
                ) {
                    username
                    email
                }
            }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.register).toEqual({
            username,
            email,
          });
        });
    });

    it('should create a new user fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
            mutation Register {
                register(
                    registerUserInput: { email: "${email}", password: "${password}", username: "${username}1" }
                ) {
                    username
                    email
                }
            }
            `,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.errors[0].statusCode).toEqual(400);
        });
    });

    it('should create a new user fail with duplicate username', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
            mutation Register {
                register(
                    registerUserInput: { email: "1${email}", password: "${password}", username: "${username}" }
                ) {
                    username
                    email
                }
            }
            `,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.errors[0].statusCode).toEqual(400);
        });
    });
  });

  describe('login User', () => {
    it('should login with user', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
           mutation Login {
                login(loginUserInput: { password: "${password}", username: "${username}" }) {
                    token
                    user {
                        createdAt
                        email
                        id
                        updatedAt
                        username
                    }
                }
            }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login).toHaveProperty('token');
          expect(res.body.data.login.user).toMatchObject({
            username,
            email,
          });
        });
    });

    it('fail with wrong username', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
           mutation Login {
                login(loginUserInput: { password: "${password}", username: "${username}1" }) {
                    token
                    user {
                        createdAt
                        email
                        id
                        updatedAt
                        username
                    }
                }
            }
            `,
        })
        .expect(404);
    });
    it('fail with wrong password', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
           mutation Login {
                login(loginUserInput: { password: "12345789", username: "${username}" }) {
                    token
                    user {
                        createdAt
                        email
                        id
                        updatedAt
                        username
                    }
                }
            }
            `,
        })
        .expect(400);
    });
  });
});
