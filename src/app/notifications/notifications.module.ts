import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { NotificationController } from './notifications.controller';
import { NotificationGateway } from './notifications.gateway';
import { NotificationService } from './notifications.service';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
