import { Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class MessageAuthor {
  @IsString()
  name: string;
  @IsString()
  image: string;
}

export class IMessageNotification {
  user: string;
  @IsString()
  image: string;
  @IsString()
  title: string;
  @IsString()
  message: string;
  @IsString()
  time: string;
  @IsObject()
  @ValidateNested()
  @Type(() => MessageAuthor)
  author: MessageAuthor;
  @IsObject()
  extra: {};
}

class Extra {
  test?: string;
}

@Schema()
export class MessageNotification
  extends Document
  implements IMessageNotification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: string;
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
  @Prop({ type: Extra })
  extra: {
    test?: string;
  };
}

const schema = SchemaFactory.createForClass(MessageNotification);

export const notificationSchema = {
  name: MessageNotification.name,
  schema,
};
