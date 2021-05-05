import { IngestClientDTO } from './client.dto';
import { NotificationAuthSendDTO } from './notification-auth.dto';
import { NotificationEventsDTO } from './pusher.routes.dto';
import { NotificationSocketEventsDTO } from './socket.routes.dto';

export * from './client.dto';
export * from './pusher.routes.dto';
export * from './socket.routes.dto';
export * from './notification-auth.dto';

export const allRoutes = [NotificationEventsDTO, NotificationSocketEventsDTO];
export const allDtos = [NotificationAuthSendDTO, IngestClientDTO];
