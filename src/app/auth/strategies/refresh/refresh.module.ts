import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../..';
import { AuthUserModule } from '../../auth.user.module';
import { RefreshController } from './refresh.controller';
import { RefreshService } from './refresh.service';

@Module({
  imports: [forwardRef(() => AuthModule), AuthUserModule],
  controllers: [RefreshController],
  providers: [RefreshService],
})
export class RefreshModule {}
