import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { AuthProviders, AuthRole, User } from 'src/models';
import { Logger } from '@nestjs/common';
import { UserDTO, UpdateUserDto } from '../users/user.dto';

type idType = ObjectId | string;

@Injectable()
export class AuthUserService {
  private readonly logger = new Logger(AuthUserService.name);

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
   * @param {idType} uid The unique identifier of the user
   */
  findUserByUid(uid: idType): Promise<User> {
    return this.userModel.findById(uid).exec();
  }

  /**
   * Find a User based on the provider's provided unique identifier
   * @param {idType} providerUid The unique identifier for the auth provider
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
   * Find a User based on their email
   * @param {string} email The email of the user
   */
  findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
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
  updateUser(uid: idType, user: UpdateUserDto): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(uid, user, { useFindAndModify: false })
      .exec();
  }

  deleteUser(uid: idType): Promise<void> {
    return this.userModel.deleteOne({ _id: uid }).exec();
  }
}
