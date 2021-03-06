import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsHexColor,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { OmitType, PartialType } from '@nestjs/swagger';
import { AuthProviders } from '../enums/provider';
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

  /** Pinned index, -1 for not pinned */
  pinned: number;

  /** If the notification should be shown in a short fashion */
  action = false;

  /** Extra information */
  @IsObject()
  extra: any;
}

/** Standard DTO, but without _id and user */
export class CreateMessageNotificationDTO extends OmitType(
  MessageNotificationDTO,
  ['_id', 'user'],
) {}

/** Create DTO, but every key is optional */
export class UpdateMessageNotificationDTO extends PartialType(
  CreateMessageNotificationDTO,
) {}

export class DeleteMessageNotificationDTO {
  _id: string;
}

/** Map intermediate notification to the DTO */
export function messageNotificationMapper(
  notf: IMessageNotification | undefined,
): MessageNotificationDTO {
  if (!notf) throw new NotFoundException();

  return {
    author: messageAuthorMapper(notf?.author),
    _id: notf?._id,
    user: notf?.user,
    image: notf?.image,
    time: notf?.time,
    title: notf?.title,
    providerType: notf?.providerType,
    extra: notf?.extra,
    color: notf?.color,
    message: notf?.message,
    pinned: notf?.pinned,
    action: notf?.action,
  };
}
