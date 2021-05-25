import { Model } from 'mongoose';
import {
  AuthTokenPayloadDTO,
  CreateMessageNotificationDTO,
  Webhook,
} from 'src/models';
import { v4 as uuid } from 'uuid';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationService } from '../notifications/notifications.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(Webhook.name)
    private webhookModel: Model<Webhook>,
    private notfService: NotificationService,
  ) {}

  create(token: AuthTokenPayloadDTO, createWebhookDto: CreateWebhookDto) {
    return this.webhookModel.create({
      user: token.sub,
      slug: uuid(),
      ...createWebhookDto,
    });
  }

  findAll(token: AuthTokenPayloadDTO) {
    return this.webhookModel.find({ user: token.sub });
  }

  findOne(token: AuthTokenPayloadDTO, id: string) {
    return this.webhookModel.findOne({ user: token.sub, _id: id });
  }

  // update(
  //   token: AuthTokenPayloadDTO,
  //   id: string,
  //   updateWebhookDto: UpdateWebhookDto,
  // ) {
  //   return `This action updates a #${id} webhook`;
  // }

  remove(token: AuthTokenPayloadDTO, id: string) {
    return this.webhookModel.deleteOne({ user: token.sub, _id: id });
  }

  async trigger(slug: string, notification: CreateMessageNotificationDTO) {
    console.log('Tring to trigger:L ', slug, notification);
    const foundWebhook = await this.webhookModel.findOne({ slug });
    if (!foundWebhook) {
      return new NotFoundException('Webhook not found');
    }
    return this.notfService.add({ sub: foundWebhook.user }, notification);
  }
}
