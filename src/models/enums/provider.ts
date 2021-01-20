import { HttpService } from '@nestjs/common';
import { enumValues } from 'src/utils';
import { User } from '..';
import { IUser } from '../schemas';

export enum AuthProviders {
  Discord = 'discord',
  Local = 'local',
  None = 'none',
}
export interface Provider {
  providerName: AuthProviders;
  id: string;
  username: string;
  avatar: string;

  accessToken: string;
  refreshToken: string;
  refreshTokens(httpService: HttpService, user: User): Promise<IUser>;
}
