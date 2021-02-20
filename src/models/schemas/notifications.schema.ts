import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsString,
  ValidateNested
} from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders } from '../enums';

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

/** @ignore */
@Schema()
export class MessageNotification
  extends Document
  implements IMessageNotification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: string;
  @Prop({ enum: AuthProviders })
  providerType: AuthProviders;
  @Prop({ required: true })
  image: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  message: string;
  @Prop({ required: true })
  time: string;
  @Prop({ required: true, type: MessageAuthor })
  author: MessageAuthor;
  //TODO: Proper typing for this
  @Prop({ type: Number })
  extra: {};
}

/**
 * The notification schema
 */
const schema = SchemaFactory.createForClass(MessageNotification);

/**
 * The notification schema
 */
export const notificationSchema = {
  name: MessageNotification.name,
  schema,
};
