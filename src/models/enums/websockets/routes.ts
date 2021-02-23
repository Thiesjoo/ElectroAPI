import {
  IMessageNotification,
  IngestClient,
  NotificationAuthDTO,
  Provider
} from '../../';

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
  /**
   * Authenticate to websocket api for sending data
   */
  [NotificationSocketRoutes.AuthSend]: (data: NotificationAuthDTO) => Provider;
  /**
   * Authenticate to receive data
   */
  [NotificationSocketRoutes.AuthReceive]: (userUid: string) => boolean;

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
  exception: (data: {
    reponse: {
      statusCode: number;
      message: string;
      error: string;
    };
    status: number;
    message: string;
  }) => void;
  /** Disconnected from server */
  disconnect: () => void;
}
