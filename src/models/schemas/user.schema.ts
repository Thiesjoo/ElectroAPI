import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { enumValues } from '../../utils';
import { AuthRole, Provider, RefreshToken } from '../enums';

/** Intermediate schema of User */
export interface IUser {
  /** The DB UID */
  _id?: string;
  /** The DB UID */
  id?: string;

  /** Name of User */
  name?: string;
  /** Email address of user */
  email?: string;
  /** Password Hash of User */
  password?: string;

  /** Role of user */
  role?: AuthRole;
  /** Provider information about User */
  providers?: Provider[];
  /** Refreshtokens of user */
  tokens?: RefreshToken[];
}

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
