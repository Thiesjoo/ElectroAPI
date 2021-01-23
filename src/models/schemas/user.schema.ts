import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { enumValues } from '../../utils';
import { AuthRole, Provider } from '../enums';
import * as mongooseUnique from 'mongoose-beautiful-unique-validation';

export interface IUser {
  _id?: string;
  id?: string;

  name?: string;
  email?: string;
  password?: string;

  role?: AuthRole;
  providers?: Provider[];
}

@Schema()
export class User extends Document implements IUser {
  @Prop({ required: true })
  name: string;
  // @ts-ignore
  @Prop({ required: true, unique: 'Password/Email combination is incorrect' })
  email: string;
  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: Array<Provider>() })
  providers: Provider[];
  @Prop({ required: true, enum: enumValues(AuthRole) })
  role: AuthRole;
}

const schema = SchemaFactory.createForClass(User);
// schema.plugin(mongoosePaginate);
// schema.plugin(mongooseUnique);
//FIXME: Jest doesn't like this

export const userSchema = {
  name: User.name,
  schema,
};
