import { faker } from '@faker-js/faker';
import { RoleType } from '@src/common/constants/role-type';
import { User } from '@src/modules/user/user.entity';
import { Wish } from '@src/modules/wish/wish.entity';

export function createDataList(factory, count = 1): unknown[] {
  return faker.helpers.multiple(factory, {
    count,
  });
}

export function createRandomUser(): Partial<User> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const password = 'password';
  return {
    email: faker.internet.email({ firstName, lastName }),
    password,
    username: faker.internet.userName({ firstName, lastName }),
    role: faker.helpers.enumValue(RoleType),
  };
}

export function createRandomWish(): Partial<Wish> {
  return {
    content: faker.lorem.paragraph(),
  };
}
