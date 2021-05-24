import { axiosInst } from 'src/common';
import { ApiConfigService } from 'src/config/configuration';
import { AuthProviders, ProviderDTO } from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { DiscordUser } from './';
import discordMapper from './strategies/providers/discord/discord.mapper';
import twitchMapper from './strategies/providers/twitch/twitch.mapper';
import { TwitchUser } from './strategies/providers/twitch/twitch.types';

type UserTypes = {
  [AuthProviders.Discord]: DiscordUser;
  [AuthProviders.Twitch]: TwitchUser;
};

type RefreshAuthProviders = Exclude<AuthProviders, AuthProviders.Local>;

/**
 * The URL's of the oauth refresh routes
 */
const oauthURLMap: {
  [key in RefreshAuthProviders]: {
    userURL: string;
    tokenURL: string;
    mapper: (
      accessToken: string,
      refreshToken: string,
      profile: UserTypes[key],
      scopes: string[],
    ) => ProviderDTO;
  };
} = {
  [AuthProviders.Discord]: {
    userURL: 'https://discord.com/api/v8/users/@me',
    tokenURL: 'https://discord.com/api/v8/oauth2/token',
    mapper: discordMapper,
  },
  [AuthProviders.Twitch]: {
    userURL: 'https://discord.com/api/v8/users/@me',
    tokenURL: 'https://discord.com/api/v8/oauth2/token',
    mapper: twitchMapper,
  },
};

/**
 * Class to refresh tokens
 */
@Injectable()
export class Oauth2RefreshService {
  /** Constructor */
  constructor(private configService: ApiConfigService) {}
  /** Logger */
  private logger = new Logger(Oauth2RefreshService.name);

  /**
   * Refresh the tokens of a specific user of a specific provider
   * @param provider The provider
   */
  async refreshTokens(provider: ProviderDTO): Promise<ProviderDTO> {
    // console.log("Going to")
    this.logger.log(`Refreshing for provider:  ${provider.providerName}`);
    const clientName = provider.providerName as RefreshAuthProviders;
    const client = oauthURLMap[clientName];

    try {
      const resp: {
        data: UserTypes[typeof clientName];
      } = await axiosInst.get(client.userURL, {
        headers: {
          authorization: `Bearer ${provider.accessToken}`,
        },
      });
      if (!resp?.data) {
        throw new Error('Refresh URL gave no response');
      }

      //TODO: Maybe incorporate some cooldown, because spamming api's is not OK
      // Update all fields that are present on provider and on the new data
      const newProvider = client.mapper(
        provider.accessToken,
        provider.refreshToken,
        //@ts-ignore TODO: Check if this works?
        resp.data,
        provider.scopes,
      );

      this.logger.log('Successfully updated user data.');
      return newProvider;
    } catch (e) {
      if (e?.response?.status !== 401) {
        this.logger.error(e);
        return null;
      }
    }

    try {
      const tokens = this.configService.getProvider(provider.providerName);
      const val = {
        client_id: tokens.clientID,
        client_secret: tokens.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: provider.refreshToken,
        redirect_uri: tokens.callbackURL,
        scope: provider.scopes.join(' '),
      };

      const resp: {
        data: {
          access_token: string;
          refresh_token: string;
          expires_in: number;
          scope: string;
          token_type: string;
        };
      } = await axiosInst.post(
        oauthURLMap[provider.providerName].tokenURL,
        new URLSearchParams(val),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      if (!resp?.data) {
        throw new Error('Refresh URL gave no response');
      }

      provider.accessToken = resp.data.access_token;
      provider.refreshToken = resp.data.refresh_token;

      return provider;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }
}
