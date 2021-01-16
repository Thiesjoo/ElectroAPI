import { HttpService } from '@nestjs/common';
import { enumValues } from 'src/utils';
import { User } from '..';
import { IUser } from '../schemas';

export enum AuthProviders {
  Discord = 'discord',
  None = 'none',
  Local = 'local',
}
export interface Provider {
  name: AuthProviders;
  id: string;
  refreshToken(httpService: HttpService, user: User): Promise<IUser>;
}
