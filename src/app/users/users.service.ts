import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthProviders, AuthRole, User } from 'src/models';
import { Logger } from '@nestjs/common';
import { UserDTO, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Find all Users
   */
  findAllUsers(): Promise<User[]> {
    return this.userModel.find({}).exec();
  }

  /**
   * Find a User with all details based on unique id
   * @param {string} uid The unique identifier of the user
   */
  findUserByUid(uid: string): Promise<User> {
    return this.userModel.findById(uid).exec();
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
    return this.userModel
      .findOne({ providers: { id: providerUid, name: providerType } })
      .exec();
  }

  /**
   * Find a User based on their name
   * @param {string} name The name of the user
   */
  findUserByName(name: string): Promise<User> {
    return this.userModel.findOne({ name }).exec();
  }

  /**
   * Create a new user
   * @param {UserDTO} user Partial details of a user
   */
  async createUser(userInput: UserDTO): Promise<User> {
    const user: User = new this.userModel({
      ...userInput,
      password: 'string',
      providers: [],
      role: AuthRole.User,
    });
    await user.save();
    return user;
  }

  /**
   * Update an existing user
   * @param {string} uid The unique identifier of the user
   * @param {UserDTO} user Partial details of the user
   */
  updateUser(uid: string, user: UpdateUserDto): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(uid, user, { useFindAndModify: false })
      .exec();
  }
}
