import { notificationSchema } from 'src/models';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  imports: [MongooseModule.forFeature([notificationSchema])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
