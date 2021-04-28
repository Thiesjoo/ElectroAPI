import { MessageNotificationDTO, Provider } from 'src/models';
import { CreateMessageNotificationDTO } from 'src/models/dto';
import { IngestClientDTO, NotificationAuthDTO } from './';

/** The routes available to a websocket client */
export enum NotificationSocketRoutes {
  AuthSend = 'authenticateSending',
  AuthReceive = 'autenticateReceiving',
  Identity = 'identity',
  GetSample = 'getSampleData',
  Ingest = 'ingest',
}

//TODO: Add typing for swagger

/** Map of socket routes and their responses */
export class NotificationSocketRequestsDTO {
  /**
   * Authenticate to websocket api for sending data
   */
  [NotificationSocketRoutes.AuthSend]: (data: NotificationAuthDTO) => Provider;
  /**
   * Authenticate to receive data
   */
  [NotificationSocketRoutes.AuthReceive]: (userUid: string) => boolean;
  [NotificationSocketRoutes.Identity]: () => IngestClientDTO;
  [NotificationSocketRoutes.GetSample]: (id: string) => MessageNotificationDTO;
  [NotificationSocketRoutes.Ingest]: (
    notf: CreateMessageNotificationDTO,
  ) => MessageNotificationDTO;
}

export class NotificationSocketEventsDTO {
  /** Route used for any exceptions */
  exception: {
    response: {
      statusCode: number;
      message: string;
      error: string;
    };
    status: number;
    message: string;
  };
}
