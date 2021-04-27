import * as Pusher from 'pusher';
import { NotificationRequests, NotificationRoutes } from '../';

export class MyPusher extends Pusher {
  trigger: <T extends NotificationRoutes>(
    channel: string,
    event: T,
    data: NotificationRequests[T],
  ) => Promise<any>;
}
