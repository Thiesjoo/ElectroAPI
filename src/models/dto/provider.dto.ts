import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders } from '../';

export class ProviderDTO {
  /** Name of provider */
  @ApiProperty({ enum: AuthProviders, enumName: 'AuthProviders' })
  providerName: AuthProviders;
  /** ID of user from provider. (So not DB Uid) */
  id: string;
  /** Username of user from provider */
  username: string;
  /** Avatar URL of user. (Must be .png) */
  avatar: string;

  /** Accesstoken of user */
  accessToken: string;
  /** Refresh token of user */
  refreshToken: string;
  /** A list of scopes that belongs to the accesstoken */
  scopes: string[];
  /** Any extra information */
  extra: any;
}
