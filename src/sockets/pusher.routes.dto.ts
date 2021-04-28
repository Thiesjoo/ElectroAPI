import {
  DeleteMessageNotificationDTO,
  MessageNotificationDTO,
} from 'src/models';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationRoutes {
  Update = 'update',
  Add = 'add',
  Remove = 'remove',
}

/** Events to subscribe to */
export class NotificationEventsDTO {
  @ApiProperty({ type: () => MessageNotificationDTO })
  /** Updated notification is returned (Same _id)*/
  [NotificationRoutes.Update]: MessageNotificationDTO;
  /** New notification added */
  @ApiProperty({ type: () => MessageNotificationDTO })
  [NotificationRoutes.Add]: MessageNotificationDTO;
  @ApiProperty({
    type: () => DeleteMessageNotificationDTO,
  })
  [NotificationRoutes.Remove]: DeleteMessageNotificationDTO;
}
