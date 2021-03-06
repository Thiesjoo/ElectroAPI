import { Document } from 'mongoose';
import { enumValues } from 'src/common';
import { AuthRole, IUser, Provider, RefreshToken } from 'src/models';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document implements IUser {
  @Prop({ required: true })
  name: string;
  // @ts-ignore
  @Prop({
    required: true,
    unique: 'Password/Email combination is incorrect or user already exists',
  })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ default: false })
  emailVerified: boolean;

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
