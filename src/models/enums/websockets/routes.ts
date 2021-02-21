import { IMessageNotification, NotificationAuthDTO } from '../../';
import { Provider } from '../provider';
import { IngestClient } from './client';

/** The routes available to a websocket client */
export enum NotificationSocketRoutes {
  Auth = 'authenticate',
  Identity = 'identity',
  Ingest = 'ingest',
  GetSample = 'getSampleData',
}

/** Map of socket routes and their responses */
export interface NotificationSocketRequests {
  [NotificationSocketRoutes.Auth]: (data: NotificationAuthDTO) => Provider;
  [NotificationSocketRoutes.Identity]: () => IngestClient;
  [NotificationSocketRoutes.Ingest]: (data: IMessageNotification) => boolean;
  [NotificationSocketRoutes.GetSample]: (id: string) => IMessageNotification;
}

/** Events to listen to */
export interface NotificationSocketEvents {
  connect: () => void;
  events: (data: any) => void;
  exception: (data: any) => void;
  disconnect: () => void;
}
