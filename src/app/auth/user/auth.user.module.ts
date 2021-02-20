import { forwardRef, Global, Module } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { AuthUserService } from './auth.user.service';

@Global()
@Module({
  imports: [forwardRef(() => AppModule)], // App module for mongoose models
  providers: [AuthUserService],
  exports: [AuthUserService],
})
export class AuthUserModule {}
