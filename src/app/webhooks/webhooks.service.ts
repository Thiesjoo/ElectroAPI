import { Model } from 'mongoose';
import {
  AuthProviders,
  AuthTokenPayloadDTO,
  CreateMessageNotificationDTO,
  Webhook,
} from 'src/models';
import { v4 as uuid } from 'uuid';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PingEvent,
  PullRequestEvent,
  PushEvent,
  ReleaseEvent,
} from '@octokit/webhooks-types';
import { NotificationService } from '../notifications/notifications.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

export enum GithubHandledEventsEnum {
  Push = 'push',
  Release = 'release',
  Ping = 'ping',
  PullRequest = 'pullrequest',
}
export const GithubHandledEvents = Object.values(GithubHandledEventsEnum); //['push', 'release', 'ping', 'pullrequest'];

export type EventsMap = {
  // type EventsMap<K extends GithubHandledEventsEnum> = {
  [GithubHandledEventsEnum.Push]: PushEvent;
  [GithubHandledEventsEnum.Release]: ReleaseEvent;
  [GithubHandledEventsEnum.Ping]: PingEvent;
  [GithubHandledEventsEnum.PullRequest]: PullRequestEvent;
};

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

  async triggerGeneric(
    slug: string,
    notification: CreateMessageNotificationDTO,
  ) {
    console.log('Tring to trigger:L ', slug, notification);
    const foundWebhook = await this.parseSlug(slug);
    return this.sendNotification(foundWebhook, notification);
  }

  async triggerGithub<K extends GithubHandledEventsEnum>(
    slug: string,
    github: EventsMap[K],
    type: K,
  ) {
    const foundWebhook = await this.parseSlug(slug);
    const notf = new CreateMessageNotificationDTO();

    notf.action = true;
    notf.providerType = AuthProviders.Github;

    notf.image =
      'https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png';
    //TODO: Maybe social url of package instead of github logo

    notf.author = {
      name: github.sender.login,
      image: github.sender.avatar_url,
    };
    notf.color = '#.....';
    notf.time = new Date();

    switch (type) {
      case GithubHandledEventsEnum.Ping: {
        notf.title = `Github: ${github.repository.full_name}`;
        notf.message = `Received ping event on repo: ${github.repository.name}`;
        break;
      }
      case GithubHandledEventsEnum.Push: {
        notf.title = `${(github as PushEvent).pusher.name} pushed to ${
          github.repository.full_name
        }`;
        notf.message = (github as PushEvent).compare;
      }
    }

    console.log(github, notf, type);

    return this.sendNotification(foundWebhook, notf);
  }

  private sendNotification(
    webhook: Webhook,
    content: CreateMessageNotificationDTO,
  ) {
    return this.notfService.add({ sub: webhook.user }, content);
  }
  private async parseSlug(slug: string): Promise<Webhook> {
    const foundWebhook = await this.webhookModel.findOne({ slug });
    if (!foundWebhook) {
      new NotFoundException('Webhook not found');
    }
    return foundWebhook;
  }
}
