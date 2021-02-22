import { IMessageNotification, NotificationAuthDTO } from '../../';
import { Provider } from '../provider';
import { IngestClient } from './client';

/** The routes available to a websocket client */
export enum NotificationSocketRoutes {
  AuthSend = 'authenticateSending',
  AuthReceive = 'autenticateReceiving',
  Identity = 'identity',
  Ingest = 'ingest',
  GetSample = 'getSampleData',
}

/** Map of socket routes and their responses */
export interface NotificationSocketRequests {
  [NotificationSocketRoutes.AuthSend]: (data: NotificationAuthDTO) => Provider;
  [NotificationSocketRoutes.AuthReceive]: (id: string) => boolean;
  [NotificationSocketRoutes.Identity]: () => IngestClient;
  [NotificationSocketRoutes.Ingest]: (data: IMessageNotification) => boolean;
  [NotificationSocketRoutes.GetSample]: (id: string) => IMessageNotification;
}

/** Events to listen to */
export interface NotificationSocketEvents {
  /** Connected to server */
  connect: () => void;
  /** Not used yet */
  events: (data: any) => void;

  /** Emitted on new notification. */
  newNotification: (data: IMessageNotification) => boolean;
  /** Route used for any expections */
  exception: (data: any) => void;
  /** Disconnected from server */
  disconnect: () => void;
}
