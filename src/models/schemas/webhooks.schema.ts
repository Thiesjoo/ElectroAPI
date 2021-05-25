import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IWebhook } from '../intermediates/';

@Schema()
export class Webhook extends Document implements IWebhook {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;
  @Prop({ type: String })
  slug: string;
}

/**
 * The webhook schema
 */
const schema = SchemaFactory.createForClass(Webhook);

export const webhookSchema = {
  name: Webhook.name,
  schema,
};
