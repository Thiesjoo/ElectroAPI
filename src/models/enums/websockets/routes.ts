import { CreateMessageNotificationDTO } from 'src/models/dto';
import {
  IngestClient,
  MessageNotificationDTO,
  NotificationAuthDTO,
  Provider,
} from '../..';

/** Events to publish */
export enum NotificationRoutes {
  Update = 'update',
  Add = 'add',
  Remove = 'Remove',
}

/** Events to subscribe to */
export interface NotificationRequests {
  /** Updated notification is returned (Same _id)*/
  [NotificationRoutes.Update]: MessageNotificationDTO;
  /** New notification added */
  [NotificationRoutes.Add]: MessageNotificationDTO;
  [NotificationRoutes.Remove]: { _id: string };
}

/** Events to EMIT */
export interface NotificationEvents {
  /** Emitted on new notification. */
  newNotification: (data: MessageNotificationDTO) => boolean;
}

/** FOR SOCKET-IO **/
/** The routes available to a websocket client */
export enum NotificationSocketRoutes {
  AuthSend = 'authenticateSending',
  AuthReceive = 'autenticateReceiving',
  Identity = 'identity',
  GetSample = 'getSampleData',
  Ingest = 'ingest',
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
  [NotificationSocketRoutes.GetSample]: (id: string) => MessageNotificationDTO;
  [NotificationSocketRoutes.Ingest]: (
    notf: CreateMessageNotificationDTO,
  ) => MessageNotificationDTO;
}
export interface NotificationSocketEvents extends NotificationEvents {
  /** Connected to server */
  connect: () => void;
  /** Not used yet */
  events: (data: any) => void;

  /** Disconnected from server */
  disconnect: () => void;
  /** Route used for any exceptions */
  exception: (data: {
    response: {
      statusCode: number;
      message: string;
      error: string;
    };
    status: number;
    message: string;
  }) => void;
}
