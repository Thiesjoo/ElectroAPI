import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRole, IUser, User } from 'src/models';
import { AuthUserService } from '../auth/auth.user.service';
import { UsersService } from './users.service';
import { Error } from 'mongoose';
import { userMapper } from './user.dto';
import { dbMock } from 'test/dbMock';

describe('UsersService', () => {
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getModelToken(User.name), useClass: dbMock },
        UsersService,
        AuthUserService,
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('creating a user', () => {
    it("correctly adds the required property's", async () => {
      const input = { name: '', email: '' };
      const res = await userService.createUser(input);
      expect(res as IUser).toMatchObject({
        ...input,
        password: 'string',
        providers: [],
        role: AuthRole.User,
      } as IUser);
    });
    it('it fails with double email', async () => {
      expect.assertions(1);
      const input = { name: '', email: '' };
      await userService.createUser(input);
      try {
        await userService.createUser(input);
      } catch (e) {
        expect(e).toBeInstanceOf(Error.ValidationError);
      }
    });
  });
});
