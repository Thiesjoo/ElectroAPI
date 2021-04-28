import { AuthProviders } from 'src/models';
import { DiscordUser } from './discord.types';

export default function (
  accessToken: string,
  refreshToken: string,
  profile: DiscordUser,
  scopes: string[],
) {
  return {
    providerName: AuthProviders.Discord,
    id: profile.id,
    username: profile.username,
    avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
    accessToken,
    refreshToken,
    extra: {
      discriminator: profile.discriminator,
      connections: profile.connections,
    },
    scopes: scopes,
  };
}
