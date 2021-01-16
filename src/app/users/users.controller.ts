import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UserDTO, userMapper } from './user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: UserDTO) {
    return userMapper(await this.usersService.createUser(createUserDto));
  }

  @Get()
  async findAll() {
    return (await this.usersService.findAllUsers()).map(userMapper);
  }

  /**
   * Get user
   * @param id UserID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return userMapper(await this.usersService.findUserByUid(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return userMapper(await this.usersService.updateUser(id, updateUserDto));
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
