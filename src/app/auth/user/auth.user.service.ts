import { FilterQuery, Model, ObjectId, UpdateQuery } from 'mongoose';
import { AuthProviders, AuthRole, User } from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDTO } from '../../users/user.dto';

type idType = ObjectId | string;

/**
 * The class that handles everything to do with users in the db
 */
@Injectable()
export class AuthUserService {
  private logger = new Logger(AuthUserService.name);

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
    localUid: string,
    providerUid: string,
    providerType: AuthProviders,
  ): Promise<User> {
    return (
      this.userModel
        .findOne({
          _id: localUid,
          //@ts-ignore
          providers: { id: providerUid, providerName: providerType },
        })
        // .findOne({})
        .exec()
    );
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
  async createUser(userInput: UserDTO, password: string): Promise<User> {
    //FIXME: Add bcrypt here
    const user: User = await this.userModel.create({
      ...userInput,
      password,
      providers: [],
      role: AuthRole.User,
    });
    await user.save();

    return user;
  }

  /**
   * Update an existing user
   * @param {string} uid The unique identifier of the user
   * @param {UpdateQuery<User>} user Partial details of the user
   */
  updateUser(uid: idType, user: UpdateQuery<User>): Promise<User> {
    return this.update({ _id: uid }, user);
  }

  /**
   * Update user, used for nested array updates
   * @param {FilterQuery<User>} filter The unique identifier of the user
   * @param { UpdateQuery<User>} update Partial details of the user
   */
  update(filter: FilterQuery<User>, update: UpdateQuery<User>): Promise<User> {
    return this.userModel
      .updateOne(filter, update, { useFindAndModify: false })
      .exec();
  }

  /**
   * Revoke a specific JWT refresh token
   * @param userUid The UID of the user
   * @param jti The UID of the token
   */
  revokeUserToken(userUid: string | ObjectId, jti: string) {
    return this.userModel
      .findOneAndUpdate(
        {
          _id: userUid,
          tokens: { $elemMatch: { jti } },
        },
        {
          $set: {
            'tokens.$.revoked': true,
          },
        },
        { useFindAndModify: false },
      )
      .exec();
  }

  /**
   * Delete a user with a given ID
   * @param uid The unique identifier of the user
   */
  deleteUser(uid: idType): Promise<void> {
    return this.userModel.deleteOne({ _id: uid }).exec();
  }
}
