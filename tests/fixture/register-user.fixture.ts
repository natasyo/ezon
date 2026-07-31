import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { RegisterType } from 'tests/types/register.type';

export function generateUser(
  ovveride: Partial<RegisterType> = {},
): RegisterType {
  const password = faker.internet.password({ length: 10 });
  const uniquePrefix = String(randomUUID().slice(0, 4));
  return {
    userName: `${uniquePrefix}_${faker.internet.username()}`,
    displayName: faker.person.fullName(),
    email: `${uniquePrefix}_${faker.internet.email()}`,
    password,
    confirmPassword: password,
    ...ovveride,
  };
}
