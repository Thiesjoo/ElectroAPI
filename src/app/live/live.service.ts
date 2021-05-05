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

  patchNotification(
    type: 'update' | 'add',
    userId: string,
    notification: IMessageNotification,
  ) {
    const mappedNotf = messageNotificationMapper(notification);
    const route =
      type === 'update' ? NotificationRoutes.Update : NotificationRoutes.Add;

    if (this.configService.liveGateway === LiveServiceTypes.Pusher) {
      this.pusher.trigger(`${pusherPrivatePrefix}${userId}`, route, mappedNotf);
    } else if (this.configService.liveGateway === LiveServiceTypes.Sockets) {
      this.socketBroadcasts.forEach((x) => x(userId, route, mappedNotf));
    }
  }

  removeNotification(userId: string, id: string) {
    const delt = { _id: id };
    if (this.configService.liveGateway === LiveServiceTypes.Pusher) {
      this.pusher.trigger(
        `${pusherPrivatePrefix}${userId}`,
        NotificationRoutes.Remove,
        delt,
      );
    } else if (this.configService.liveGateway === LiveServiceTypes.Sockets) {
      this.socketBroadcasts.forEach((x) =>
        x(userId, NotificationRoutes.Remove, delt),
      );
    }
  }

  pong(userId: string) {
    this.socketBroadcasts.forEach((x) => {
      x(userId, NotificationRoutes.Pong, Date.now());
    });
  }
}
