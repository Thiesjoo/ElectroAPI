import { InjectionTokens } from 'src/common/injection.tokens';
import { ApiConfigService } from 'src/config/configuration';
import {
  IMessageNotification,
  ListenerType,
  LiveServiceTypes,
  messageNotificationMapper,
  MyPusher,
  pusherPrivatePrefix,
} from 'src/models';
import { NotificationRoutes, NotificationSocketEventsDTO } from 'src/sockets';
import { Inject } from '@nestjs/common';

type BroadcastArgs = <T extends keyof NotificationSocketEventsDTO>(
  user: string,
  channel: T,
  message: ListenerType<NotificationSocketEventsDTO[T]>,
) => void;

export class LiveService {
  map: BroadcastArgs[] = [];

  constructor(
    @Inject(InjectionTokens.Pusher) private pusher: MyPusher,
    private configService: ApiConfigService,
  ) {}

  init(func: BroadcastArgs) {
    this.map.push(func);
  }

  updateNotification(userId: string, notification: IMessageNotification) {
    if (this.configService.liveGateway === LiveServiceTypes.Pusher) {
      this.pusher.trigger(
        `${pusherPrivatePrefix}${userId}`,
        NotificationRoutes.Update,
        messageNotificationMapper(notification),
      );
    } else if (this.configService.liveGateway === LiveServiceTypes.Sockets) {
      //Testing
    }
  }
}
