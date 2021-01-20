import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UserDTO, userMapper } from './user.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeveloperOnly } from 'src/models';
import { ObjectId } from 'mongoose';

@Controller('api/users')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description:
    'Whenever the bearer token is missing, the request will be denied',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'The roles of the user did not match any of the allowed roles',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Something else went wrong',
})
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   * @param createUserDto A new user
   */
  @Post()
  @DeveloperOnly()
  async create(@Body() createUserDto: UserDTO) {
    return userMapper(await this.usersService.createUser(createUserDto));
  }

  /**
   * Get all users
   */
  @Get()
  @DeveloperOnly()
  async findAll() {
    return (await this.usersService.findAllUsers()).map(userMapper);
  }

  /**
   * Get user based on ID
   * @param id UserID
   */
  @Get(':id')
  @DeveloperOnly()
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
  @DeveloperOnly()
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return userMapper(await this.usersService.updateUser(id, updateUserDto));
  }

  @Delete(':id')
  @DeveloperOnly()
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
