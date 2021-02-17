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
  scopes: string[];
  extra: any;
}
