import { ApiConfigService } from 'src/config/configuration';
import { AuthProviders, Provider } from 'src/models';
import { axiosInst } from 'src/utils';
import { Injectable, Logger } from '@nestjs/common';
import { DiscordUser } from './';

/**
 * The URL's of the oauth refresh routes
 */
const oauthURLMap: {
  [key in AuthProviders]: {
    userURL: string;
    tokenURL: string;
  };
} = {
  [AuthProviders.Discord]: {
    userURL: 'https://discord.com/api/v8/users/@me',
    tokenURL: 'https://discord.com/api/v8/oauth2/token',
  },
  [AuthProviders.Local]: null,
  [AuthProviders.None]: null,
};

type UserTypes = {
  [AuthProviders.Discord]: DiscordUser;
  [AuthProviders.Local]: {
    test: string;
  };
  [AuthProviders.None]: null;
};

/**
 * Class to refresh tokens
 */
@Injectable()
export class Oauth2RefreshService {
  /** Constructor */
  constructor(private configService: ApiConfigService) {}
  /** Logger */
  private readonly logger = new Logger(Oauth2RefreshService.name);

  /**
   * Refresh the tokens of a specific user of a specific provider
   * @param provider The provider
   */
  async refreshTokens(provider: Provider): Promise<Provider> {
    let tokens = this.configService.getProvider(provider.providerName);
    const val = {
      client_id: tokens.clientID,
      client_secret: tokens.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: provider.refreshToken,
      redirect_uri: tokens.callbackURL,
      scope: provider.scopes.join(' '),
    };

    try {
      const resp: {
        data: UserTypes[typeof provider.providerName];
      } = await axiosInst.get(oauthURLMap[provider.providerName].userURL, {
        headers: {
          authorization: `Bearer ${provider.accessToken}`,
        },
      });
      if (!resp?.data) {
        throw new Error('Refresh URL gave no response');
      }

      //TODO: Check if this works
      //TODO: Maybe incorporate some cooldown, because spamming api's is not OK
      // Update all fields that are present on provider and on the new data
      Object.entries(resp.data).forEach((x) => {
        if (provider.hasOwnProperty(x[0])) {
          provider[x[0]] = x[1];
        }
      });
      Logger.log('Updated user data.', 'auth-refresh.service');
      return provider;
    } catch (e) {
      if (e?.response?.status !== 401) {
        Logger.error(e);
        return null;
      }
    }

    try {
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
      Logger.error(e);
      return null;
    }
  }
}
