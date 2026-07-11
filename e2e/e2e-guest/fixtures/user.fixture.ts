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

export interface ExistingUser {
  email: string;
  password: string;
  userName: string;
  displayName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export function getExistingUser(
  role: ExistingUser['role'] = 'EMPLOYEE',
): ExistingUser {
  const users: Record<ExistingUser['role'], ExistingUser> = {
    ADMIN: {
      email: 'admin@ezon.local',
      password: 'password123',
      userName: 'admin',
      displayName: 'Администратор',
      role: 'ADMIN',
    },
    MANAGER: {
      email: 'manager@ezon.local',
      password: 'password123',
      userName: 'manager',
      displayName: 'Менеджер склада',
      role: 'MANAGER',
    },
    EMPLOYEE: {
      email: 'worker@ezon.local',
      password: 'password123',
      userName: 'worker',
      displayName: 'Сотрудник',
      role: 'EMPLOYEE',
    },
  };
  return users[role];
}
