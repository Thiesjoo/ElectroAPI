import { InjectionTokens } from 'src/common/injection.tokens';
import { ApiConfigService } from 'src/config/configuration';
import {
  IMessageNotification,
  LiveServiceTypes,
  messageNotificationMapper,
  MyPusher,
  pusherPrivatePrefix,
} from 'src/models';
import { NotificationEventsDTO, NotificationRoutes } from 'src/sockets';
import { Inject } from '@nestjs/common';

type BroadcastArgs = <T extends keyof NotificationEventsDTO>(
  user: string,
  channel: T,
  message: NotificationEventsDTO[T],
) => void;

export class LiveService {
  socketBroadcasts: BroadcastArgs[] = [];

  constructor(
    @Inject(InjectionTokens.Pusher) private pusher: MyPusher,
    private configService: ApiConfigService,
  ) {}

  init(func: BroadcastArgs) {
    if (this.socketBroadcasts.length > 0)
      console.error('There are multiple socket services');
    this.socketBroadcasts.push(func);
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
      this.socketBroadcasts.forEach((x) =>
        x(
          userId,
          NotificationRoutes.Update,
          messageNotificationMapper(notification),
        ),
      );
    }
  }

  pong(userId: string) {
    this.socketBroadcasts.forEach((x) => {
      x(userId, NotificationRoutes.Pong, Date.now());
    });
  }
}
