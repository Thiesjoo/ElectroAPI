import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthProviders, User } from 'src/models';
import { Logger } from '@nestjs/common';
import { UserDTO, UpdateUserDto } from '../users/user.dto';
import { AuthUserService } from '../auth/auth.user.service';
import { ObjectId } from 'mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly authUserService: AuthUserService) {}

  /**
   * Find all Users
   */
  findAllUsers(): Promise<User[]> {
    return this.authUserService.findAllUsers();
  }

  /**
   * Find a User with all details based on unique id
   * @param {string} uid The unique identifier of the user
   */
  async findUserByUid(uid: string | ObjectId): Promise<User> {
    const found = await this.authUserService.findUserByUid(uid);
    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  /**
   * Find a User based on the provider's provided unique identifier
   * @param {string} providerUid The unique identifier for the auth provider
   * @param {AuthProvider} providerType The type of external provider
   */
  findUserByProviderUid(
    providerUid: string,
    providerType: AuthProviders,
  ): Promise<User> {
    return this.authUserService.findUserByProviderUid(
      providerUid,
      providerType,
    );
  }

  /**
   * Find a User based on their name
   * @param {string} name The name of the user
   */
  findUserByName(name: string): Promise<User> {
    return this.authUserService.findUserByName(name);
  }

  /**
   * Create a new user
   * @param {UserDTO} user Partial details of a user
   */
  createUser(userInput: UserDTO): Promise<User> {
    return this.authUserService.createUser(userInput);
  }

  /**
   * Update an existing user
   * @param {string} uid The unique identifier of the user
   * @param {UserDTO} user Partial details of the user
   */
  updateUser(uid: string, user: UpdateUserDto): Promise<User> {
    return this.authUserService.updateUser(uid, user);
  }

  deleteUser(uid: string): Promise<void> {
    return this.authUserService.deleteUser(uid);
  }
}
