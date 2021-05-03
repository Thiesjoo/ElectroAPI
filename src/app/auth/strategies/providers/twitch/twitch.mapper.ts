import { AuthProviders } from 'src/models';
import { TwitchUser } from './twitch.types';

export default function (
  accessToken: string,
  refreshToken: string,
  profile: TwitchUser,
  scopes: string[],
) {
  return {
    providerName: AuthProviders.Twitch,
    id: profile._id.toString(),
    username: profile.display_name,
    avatar: profile.logo,
    accessToken,
    refreshToken,
    extra: {},
    scopes: scopes,
  };
}
