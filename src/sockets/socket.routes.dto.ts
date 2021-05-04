import { MessageNotificationDTO, ProviderDTO } from 'src/models';
import { CreateMessageNotificationDTO } from 'src/models/dto';
import { IngestClientDTO, NotificationAuthDTO } from './';
import { NotificationEventsDTO } from './pusher.routes.dto';

/** The routes available to a websocket client */
export enum NotificationSocketRoutes {
  AuthSend = 'authenticateSending',
  AuthReceive = 'autenticateReceiving',
  Identity = 'identity',
  GetSample = 'getSampleData',
  Ingest = 'ingest',
  Test = 'test',
}

//TODO: Add typing for swagger

/** Map of socket routes and their responses */
export class NotificationSocketEventsDTO extends NotificationEventsDTO {
  /**
   * Authenticate to websocket api for sending data
   */
  [NotificationSocketRoutes.AuthSend]: (
    data: NotificationAuthDTO,
  ) => ProviderDTO;
  /**
   * Authenticate to receive data
   */
  [NotificationSocketRoutes.AuthReceive]: (userUid: string) => boolean;
  [NotificationSocketRoutes.Identity]: () => IngestClientDTO;
  [NotificationSocketRoutes.GetSample]: (id: string) => MessageNotificationDTO;
  [NotificationSocketRoutes.Ingest]: (
    notf: CreateMessageNotificationDTO,
  ) => MessageNotificationDTO;
  [NotificationSocketRoutes.Test]: () => string;

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
