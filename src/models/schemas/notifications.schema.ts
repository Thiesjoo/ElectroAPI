import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuthProviders } from '../';
import { IMessageAuthor, IMessageNotification } from '../intermediates/';

@Schema()
export class MessageNotification
  extends Document
  implements IMessageNotification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;
  @Prop({ enum: AuthProviders, required: true })
  providerType: AuthProviders;
  @Prop({})
  image: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  message: string;
  @Prop({ required: true, type: Date })
  time: Date;
  @Prop({ required: true })
  color: string;
  @Prop({ required: true, type: IMessageAuthor })
  author: IMessageAuthor;
  @Prop({})
  pinned: number;
  @Prop({ default: false })
  action: boolean;
  @Prop({ type: MongooseSchema.Types.Mixed })
  extra: any;
}

/**
 * The notification schema
 */
const schema = SchemaFactory.createForClass(MessageNotification);
// TODO: Maybe implement this:
// schema.index({ message: 'text', 'author.name': 'text', title: 'text' });
// Disadvantage is that splitting(Searching only in message) isnt possible

/**
 * The notification schema
 */
export const notificationSchema = {
  name: MessageNotification.name,
  schema,
};
