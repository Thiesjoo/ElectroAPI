import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuthProviders } from '../';
import {
  IMessageNotification,
  MessageAuthor
} from '../intermediates/notification.intermediate';

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
