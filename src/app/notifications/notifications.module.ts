import { forwardRef, Module } from '@nestjs/common';
import { AuthModule, AuthUserModule } from '../';
import { AppModule } from '../app.module';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  imports: [forwardRef(() => AppModule), AuthModule, AuthUserModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
