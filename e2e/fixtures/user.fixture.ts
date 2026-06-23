import { RegisterDto } from 'src/modules/users/dto/register.dto';
import { faker } from '@faker-js/faker';

export function createRegisterData(
  ovverides?: Partial<RegisterDto>,
): RegisterDto {
  const password = faker.internet.password({ length: 10 });
  return {
    email: faker.internet.email(),
    userName: faker.internet.username().substring(0, 20),
    displayName: faker.person.fullName(),
    password: password,
    confirmPassword: password,
    ...ovverides,
  };
}
