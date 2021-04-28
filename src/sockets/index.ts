import { NotificationEventsDTO } from './pusher.routes.dto';
import {
  NotificationSocketEventsDTO,
  NotificationSocketRequestsDTO,
} from './socket.routes.dto';

export * from './client.dto';
export * from './pusher.routes.dto';
export * from './socket.routes.dto';
export * from './notification-auth.dto';

export const allRoutes = [
  NotificationEventsDTO,
  NotificationSocketRequestsDTO,
  NotificationSocketEventsDTO,
];
