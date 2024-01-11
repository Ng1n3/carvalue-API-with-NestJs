import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { filter } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      // find: () => Promise.resolve([]),
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      // create: (email: string, password: string) =>
      //   Promise.resolve({ id: 1, email, password } as User),
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Create a new user with a salted and hashed password', async () => {
    const user = await service.signup('newmail@gmaillcom', '123456');
    expect(user.password).not.toEqual('123456');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('newmail@gmail.com', '123456')
    await expect(async () => {
      await service.signup('newmail@gmail.com', '123456');
    }).rejects.toThrow();
  });

  it('throws if signin is called with an unsed email', async () => {
    await expect(async () => {
      await service.signin('dadf@gmail.com', 'dafdad');
    }).rejects.toThrow();
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('lasdadf@gmail.com', 'mypassword')
    await expect(async () => {
      await service.signin('lasdadf@gmail.com', 'dafdk;faj');
    }).rejects.toThrow();
  });

  it('returns a user if password is proviced', async () => {
    await service.signup('dasdf@gmail.com', 'mypassword');
    const user = await service.signin('dasdf@gmail.com', 'mypassword');
    expect(user).toBeDefined();
  });
});