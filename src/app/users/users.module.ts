import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { AuthModule } from '../auth/auth.module';
import { AuthUserModule } from '../auth/auth.user.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [forwardRef(() => AppModule), AuthModule, AuthUserModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
