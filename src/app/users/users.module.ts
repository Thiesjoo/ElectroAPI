import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AppModule } from '../app.module';
import { AuthUserModule } from '../auth/auth.user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AppModule), AuthModule, AuthUserModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
