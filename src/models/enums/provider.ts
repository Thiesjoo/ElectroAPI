/** Provider Types */
export enum AuthProviders {
  Discord = 'discord',
  Local = 'local',
  None = 'none',
}

/** Information about a provider */
export interface Provider {
  /** Name of provider */
  providerName: AuthProviders;
  /** ID of user from provider. (So not DB Uid) */
  id: string;
  /** Username of user from provider */
  username: string;
  /** Avatar URL of user. (Must be .png) */
  avatar: string;

  /** Accesstoken of user */
  accessToken: string;
  /** Refreshtoken of user */
  refreshToken: string;
  /** A list of scopes that belongs to the accesstoken */
  scopes: string[];
  /** Any extra information */
  extra: any;
}
