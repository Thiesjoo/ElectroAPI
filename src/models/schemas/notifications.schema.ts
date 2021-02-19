import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsString, ValidateNested } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders } from '../enums';

export class MessageAuthor {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  image: string;
}

export class IMessageNotification {
  user: string;
  @ApiProperty()
  @IsEnum(AuthProviders)
  providerType: AuthProviders;
  @ApiProperty()
  @IsString()
  image: string;
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsString()
  time: string;
  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => MessageAuthor)
  author: MessageAuthor;
  @IsObject()
  @ApiProperty()
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
