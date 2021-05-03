

/** Provider Types */
export enum AuthProviders {
  Discord = 'discord',
  Twitch = 'twitch',
}

/** Extra types that are local and do not have refresh services */
enum ExtraAuthProviders {
  Local = 'local',
  ApiKey = 'apikey',
}

/** Combination of all names */
export const AuthNames = { ...AuthProviders, ...ExtraAuthProviders };

/** Information about a provider */
