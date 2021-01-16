import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { enumValues } from '../../utils';
import { AuthRole, Provider } from '../enums';

export interface IUser {
  _id?: string;
  id?: string;
  name?: string;

  providers: Provider[];
  role: AuthRole;
  apiKey?: string;
}

@Schema()
export class User extends Document implements IUser {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, type: Array<Provider>() })
  providers: Provider[];
  @Prop({ required: true, enum: enumValues(AuthRole) })
  role: AuthRole;
  @Prop()
  apiKey: string;
}

const schema = SchemaFactory.createForClass(User);
schema.plugin(mongoosePaginate);

export const userSchema = {
  name: User.name,
  schema,
};
