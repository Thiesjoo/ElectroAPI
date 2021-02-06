import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { enumValues } from '../../utils';
import { AuthRole, Provider, RefreshToken } from '../enums';

export interface IUser {
  _id?: string;
  id?: string;

  name?: string;
  email?: string;
  password?: string;

  role?: AuthRole;
  providers?: Provider[];
  tokens?: RefreshToken[];
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
  @Prop({ type: Array<RefreshToken>() })
  tokens: RefreshToken[];
}

const schema = SchemaFactory.createForClass(User);

export const userSchema = {
  name: User.name,
  schema,
};
