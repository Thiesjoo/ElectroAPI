import {
  IMessageNotification,
  IngestClient,
  NotificationAuthDto,
  Provider
} from '../../';

/** Events to publish */
export enum NotificationRoutes {
  Ingest = 'ingest',
  Update = 'update',
}

/** Publisch event types */
export interface NotificationRequests {
  /** */
  [NotificationRoutes.Ingest]: (data: IMessageNotification) => boolean;

  /** */
  [NotificationRoutes.Update]: (data: IMessageNotification) => boolean;
}

/** Events to receive */
export interface NotificationEvents {
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
}

/******/
// All the socket routes
/** The routes available to a websocket client */
export enum NotificationSocketRoutes {
  AuthSend = 'authenticateSending',
  AuthReceive = 'autenticateReceiving',
  Identity = 'identity',
  GetSample = 'getSampleData',
}

/** Map of socket routes and their responses */
export interface NotificationSocketRequests extends NotificationRequests {
  /**
   * Authenticate to websocket api for sending data
   */
  [NotificationSocketRoutes.AuthSend]: (data: NotificationAuthDto) => Provider;
  /**
   * Authenticate to receive data
   */
  [NotificationSocketRoutes.AuthReceive]: (userUid: string) => boolean;

  [NotificationSocketRoutes.Identity]: () => IngestClient;
  [NotificationSocketRoutes.GetSample]: (id: string) => IMessageNotification;
}

export interface NotificationSocketEvents extends NotificationEvents {
  /** Connected to server */
  connect: () => void;
  /** Not used yet */
  events: (data: any) => void;

  /** Disconnected from server */
  disconnect: () => void;
}
