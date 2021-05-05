import { AuthProviders, MessageNotificationDTO, ProviderDTO } from 'src/models';
import { CreateMessageNotificationDTO } from 'src/models/dto';

import { IngestClientDTO, NotificationAuthSendDTO } from './';

/** The routes available to a websocket client (Sending only, all the receiving stuff is in pusher)*/
export enum NotificationSocketRoutes {
  AuthSend = 'authenticateSending',
  AuthReceive = 'authenticateReceiving',
  SendIdentity = 'sendIdentity',
  GetSample = 'getSampleData',
  Ingest = 'ingest',
  Ping = 'ping',
}

/** Map of socket routes and their responses */
export class NotificationSocketEventsDTO {
  /**
   * Authenticate to websocket api for sending data
   */
  [NotificationSocketRoutes.AuthSend]:
    | ((data: NotificationAuthSendDTO) => ProviderDTO)
    | ((data: {
        provider: AuthProviders.Local;
        id: string;
      }) => { ok: boolean });
  /**)
   * Authenticate to receive data
   */

  [NotificationSocketRoutes.AuthReceive]: (userUid: string) => boolean;
  /** Return the provider type of the current socket */
  [NotificationSocketRoutes.SendIdentity]: () => IngestClientDTO;
  [NotificationSocketRoutes.GetSample]: (id: string) => MessageNotificationDTO;

  [NotificationSocketRoutes.Ingest]: (
    notf: CreateMessageNotificationDTO,
  ) => MessageNotificationDTO;
  [NotificationSocketRoutes.Ping]: () => string;

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
