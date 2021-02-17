import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { AuthUserService } from './auth.user.service';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [AuthUserService],
  exports: [AuthUserService],
})
export class AuthUserModule {}
