import { userSchema } from 'src/models';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([userSchema])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
