import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsString,
  ValidateNested
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders } from '../';

/**
 * General notification author
 */
export class MessageAuthor {
  /** Name of the author */
  @ApiProperty()
  @IsString()
  name: string;
  /** Profile picture of the author */
  @ApiProperty()
  @IsString()
  image: string;
}

/**
 * General notification class
 */
export class IMessageNotification {
  @ApiProperty({
    description: 'The unique ID of the notification',
  })
  _id?: string;
  /** The id of the user */
  @ApiProperty({
    description: 'The unique ID of the user',
  })
  user: string;
  /** The provider type of the user */
  @ApiProperty()
  @IsEnum(AuthProviders)
  providerType: AuthProviders;
  /** The image */
  @ApiProperty()
  @IsString()
  image: string;
  /** The title */
  @ApiProperty()
  @IsString()
  title: string;
  /** The message  */
  @ApiProperty()
  @IsString()
  message: string;
  /** The date as a string */
  @ApiProperty()
  @IsDateString()
  time: string;
  /** The author of the message */
  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => MessageAuthor)
  author: MessageAuthor;
  /** Extra information */
  @IsObject()
  @ApiProperty()
  extra: {};
}
