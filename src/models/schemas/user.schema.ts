import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../';
import { enumValues } from '../../utils';
import { AuthRole, Provider, RefreshToken } from '../enums';

/** @ignore */
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

/** The schema */
const schema = SchemaFactory.createForClass(User);

/** The schema and name */
export const userSchema = {
  name: User.name,
  schema,
};
