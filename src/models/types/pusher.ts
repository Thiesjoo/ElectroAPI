import * as Pusher from 'pusher';
import { NotificationEventsDTO, NotificationRoutes } from 'src/sockets';

export class MyPusher extends Pusher {
  trigger: <T extends NotificationRoutes>(
    channel: string,
    event: T,
    data: NotificationEventsDTO[T],
  ) => Promise<any>;
}
