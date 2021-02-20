import { ObjectId } from 'mongoose';
import { AuthPrefixes, DeveloperOnly, ResponsePrefix } from 'src/models';
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
import { UpdateUserDto, UserDTO, userMapper } from './user.dto';
import { UsersService } from './users.service';

@Controller('api/users')
@AuthPrefixes(JwtGuard, [DeveloperOnly()])
@ResponsePrefix()
@ApiTags('User')
export class UsersController {
  constructor(private usersService: UsersService) {}

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
