import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsHexColor,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AuthProviders } from '../';
import { IMessageNotification } from '../intermediates';
import { MessageAuthorDTO, messageAuthorMapper } from './message-author.dto';

export class MessageNotificationDTO {
  /** The unique ID of the notification */
  _id: string;
  /** The id of the user */
  user: string;
  /** The image */
  @IsString()
  image: string;
  /** The title */
  @IsString()
  title: string;
  /** The message  */
  @IsString()
  message: string;
  /** The date as a string */
  @IsDateString()
  time: Date;
  /** The date as a string */
  @IsHexColor()
  color: string;
  /** The author of the message */
  @IsObject()
  @ValidateNested()
  @Type(() => MessageAuthorDTO)
  author: MessageAuthorDTO;

  /** The provider type of the user */
  @IsEnum(AuthProviders)
  providerType: AuthProviders;

  /** Extra information */
  @IsObject()
  extra: any;
}

export function messageNotificationMapper(
  notf: IMessageNotification,
): MessageNotificationDTO {
  return {
    author: messageAuthorMapper(notf.author),
    _id: notf?._id,
    user: notf?.user,
    image: notf?.image,
    time: notf?.time,
    title: notf?.title,
    providerType: notf?.providerType,
    extra: notf?.extra,
    color: notf?.color,
    message: notf?.message,
  };
}
