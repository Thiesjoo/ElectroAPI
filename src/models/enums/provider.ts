import { ApiProperty } from '@nestjs/swagger';

/** Provider Types */
export enum AuthProviders {
  Discord = 'discord',
}

/** Extra types that are local and do not have refresh services */
enum ExtraAuthProviders {
  Local = 'local',
}

/** Combination of all names */
export const AuthNames = { ...AuthProviders, ...ExtraAuthProviders };

/** Information about a provider */
export class Provider {
  /** Name of provider */
  @ApiProperty({ enum: AuthProviders, enumName: 'AuthProviders' })
  providerName: AuthProviders;
  /** ID of user from provider. (So not DB Uid) */
  @ApiProperty()
  id: string;
  /** Username of user from provider */
  @ApiProperty()
  username: string;
  /** Avatar URL of user. (Must be .png) */
  @ApiProperty()
  avatar: string;

  /** Accesstoken of user */
  @ApiProperty()
  accessToken: string;
  /** Refreshtoken of user */
  @ApiProperty()
  refreshToken: string;
  /** A list of scopes that belongs to the accesstoken */
  @ApiProperty()
  scopes: string[];
  /** Any extra information */
  @ApiProperty()
  extra: any;
}
