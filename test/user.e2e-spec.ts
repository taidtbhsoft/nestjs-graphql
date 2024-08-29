import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  initTest,
  createDataMock,
  createRandomUser,
  getToken,
} from './init-testing-app';
import { faker } from '@faker-js/faker';
import { User } from '@src/modules/user/user.entity';
import { RoleType } from '@src/common/constants/role-type';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const gql = '/graphql';
  let users = [];
  let token = '';
  beforeAll(async () => {
    app = await initTest();
    const usersMock = faker.helpers.multiple(createRandomUser, {
      count: 5,
    });
    usersMock[0].role = RoleType.ADMIN;
    users = await createDataMock(usersMock, User);
    const tokenData = await getToken(users[0]);
    token = tokenData.token;
  });
  afterAll(() => app.close());
  describe('getUserList', () => {
    it('fail with 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `
              query GetUserList {
                  getUserList {
                      count
                      data {
                          id
                          createdAt
                          email
                          updatedAt
                          username
                          wishCount
                      }
                  }
              }
              `,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.errors[0].statusCode).toEqual(401);
        });
    });

    it('should return user list', () => {
      return request(app.getHttpServer())
        .post(gql)
        .set({ Authorization: 'Bearer ' + token })
        .send({
          query: `
          query GetUserList {
              getUserList {
                  count
                  data {
                      id
                      createdAt
                      email
                      updatedAt
                      username
                      wishCount
                  }
              }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          const resData = res.body.data.getUserList;
          expect(resData).toMatchObject({
            count: users.length,
            data: users.map(({ id, username, email }) => ({
              id,
              username,
              email,
            })),
          });
        });
    });
  });

  describe('create User', () => {
    it('should create new user', () => {
      const newUser = createRandomUser();
      newUser.role = RoleType.ADMIN;
      return request(app.getHttpServer())
        .post(gql)
        .set({ Authorization: 'Bearer ' + token })
        .send({
          query: `
          mutation CreateUser {
                createUser(
                    createUserData: { email: "${newUser.email}", password: "${newUser.password}", role: ${newUser.role}, username: "${newUser.username}" }
                ) {
                    createdAt
                    email
                    id
                    updatedAt
                    username
                }
            }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser).toMatchObject({
            email: newUser.email,
            username: newUser.username,
          });
        });
    });
  });

  describe('update User', () => {
    it('should update user', () => {
      return request(app.getHttpServer())
        .post(gql)
        .set({ Authorization: 'Bearer ' + token })
        .send({
          query: `
          mutation UpdateUser {
                updateUser(id: "${users[1].id}", updateUserData: { role: ${RoleType.ADMIN} }) {
                    createdAt
                    email
                    id
                    role
                    updatedAt
                    username
                }
            }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateUser).toMatchObject({
            id: users[1].id,
            email: users[1].email,
            role: RoleType.ADMIN,
          });
        });
    });
  });

  describe('deleteUser', () => {
    it('should delete user', () => {
      return request(app.getHttpServer())
        .post(gql)
        .set({ Authorization: 'Bearer ' + token })
        .send({
          query: `
          mutation DeleteUser {
                deleteUser(id: "${users[2].id}") 
            }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteUser).toEqual(true);
        });
    });
  });
});
