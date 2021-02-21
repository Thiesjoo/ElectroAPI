/** The routes available to a websocket client */

import { Provider } from '../provider';
import { IngestClient } from './client';

export enum NotificationSocketRoutes {
  Auth = 'authenticate',
  Identity = 'identity',
  Ingest = 'ingest',
}

export interface NotificationSocketRequests {
  [NotificationSocketRoutes.Auth]: (data: any) => Provider;
  [NotificationSocketRoutes.Ingest]: () => IngestClient;
}

export interface NotificationSocketEvents {
  connect: () => void;
  events: (data: any) => void;
  exception: (data: any) => void;
  disconnect: () => void;
}
