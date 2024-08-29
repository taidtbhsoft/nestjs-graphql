import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { initTest } from './initTestingApp';
import { createRandomUser } from './dataFactory';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const gql = '/graphql';
  let { token = '', refreshToken = '' } = {};
  // Init mock data
  const { username, password, email } = createRandomUser();

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
                    refreshToken
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
          const resData = res.body.data.login;
          token = resData.token;
          refreshToken = resData.refreshToken;
          expect(resData).toHaveProperty('token');
          expect(resData.user).toMatchObject({
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
  describe('get New Access Token', () => {
    it('should return new token', async () => {
      const { body } = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
            mutation GetToken {
              getToken(refreshToken: "${refreshToken}") {
                  token
              }
            }
          `,
        })
        .expect(200);
      token = body.data.getToken.token;
      return expect(body.data.getToken).toHaveProperty('token');
    });
    it('fail with invalid token', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
            mutation GetToken {
              getToken(refreshToken: "${token}") {
                  token
              }
            }
          `,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.errors[0].statusCode).toEqual(401);
        });
    });
  });

  describe('log Out', () => {
    it('should log Out', async () => {
      const { body } = await request(app.getHttpServer())
        .post(gql)
        .set({ Authorization: 'Bearer ' + token })
        .send({
          query: `
            mutation logOut {
              logOut(refreshToken: "${refreshToken}")
            }
          `,
        })
        .expect(200);
      return expect(body.data.logOut).toEqual(true);
    });
    it('fail with invalid token', () => {
      return request(app.getHttpServer())
        .post(gql)
        .set({ Authorization: 'Bearer ' + refreshToken })
        .send({
          query: `
            mutation logOut {
              logOut(refreshToken: "${token}")
            }
          `,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.errors[0].statusCode).toEqual(401);
        });
    });
  });
});
