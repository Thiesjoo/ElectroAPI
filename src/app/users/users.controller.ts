import { ObjectId } from 'mongoose';
import {
  AuthedUser,
  AuthPrefixes,
  DeveloperOnly,
  ResponsePrefix,
  UserToken
} from 'src/common';
import { ApiConfigService } from 'src/config/configuration';
import {
  AuthTokenPayload,
  UpdateUserDto,
  UserDTO,
  userMapper
} from 'src/models';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';

/** Controller only for developers. Used to edit DB users */
@Controller('api/users')
@AuthPrefixes(JwtGuard, [DeveloperOnly()])
@ResponsePrefix()
@ApiTags('User')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private configService: ApiConfigService,
  ) {}

  /**
   * Create a new user
   * @param createUserDto A new user
   */
  @Post()
  async create(@Body() createUserDto: UserDTO) {
    return userMapper(await this.usersService.createUser(createUserDto));
  }

  /**
   * Get all users
   */
  @Get()
  async findAll() {
    return (await this.usersService.findAllUsers()).map(userMapper);
  }

  /** Get yourself as a user */
  @Get('/me')
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserDTO,
    description: 'The single user requested',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User with given ID was not found',
  })
  @AuthedUser()
  async getMe(@UserToken('id') token: AuthTokenPayload) {
    let user = userMapper(await this.usersService.findUserByUid(token.sub));
    user.gateway = this.configService.pusherConfig.key;
    return user;
  }

  /**
   * Get user based on ID
   * @param id UserID
   */
  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserDTO,
    description: 'The single user requested',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User with given ID was not found',
  })
  async findOne(@Param('id') id: ObjectId) {
    return userMapper(await this.usersService.findUserByUid(id));
  }

  /**
   * Update part of a user with a given ID
   * @param id UserID
   * @param updateUserDto Part of a user
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return userMapper(await this.usersService.updateUser(id, updateUserDto));
  }

  /**
   * Delete a user from the DB
   * @param id Id of user
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { ok: true };
  }
}
