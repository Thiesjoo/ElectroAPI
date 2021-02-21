import { ObjectId } from 'mongoose';
import { AuthProviders, UpdateUserDto, User, UserDTO } from 'src/models';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthUserService } from '../auth/';

/** The service for the user controller */
@Injectable()
export class UsersService {
  /** The logger of this service */
  private logger = new Logger(UsersService.name);

  /** Constructor */
  constructor(private authUserService: AuthUserService) {}

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
    userUid: string,
    providerUid: string,
    providerType: AuthProviders,
  ): Promise<User> {
    return this.authUserService.findUserByProviderUid(
      userUid,
      providerUid,
      providerType,
    );
  }

  /**
   * Create a new user
   * @param {UserDTO} user Partial details of a user
   */
  createUser(userInput: UserDTO): Promise<User> {
    try {
      return this.authUserService.createUser(userInput, 'string');
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Update an existing user
   * @param {string} uid The unique identifier of the user
   * @param {UserDTO} user Partial details of the user
   */
  updateUser(uid: string, user: UpdateUserDto): Promise<User> {
    return this.authUserService.updateUser(uid, user);
  }

  /**
   * Delete a user with a given ID
   * @param uid The unique identifier of the user
   */
  deleteUser(uid: string): Promise<void> {
    return this.authUserService.deleteUser(uid);
  }
}
