import { ApiConfigService } from 'src/config/configuration';
import { AuthProviders, Provider, User } from 'src/models';
import { axiosInst, enumValues } from 'src/utils';
import { HttpService, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

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

@Injectable()
export class Oauth2RefreshService {
  constructor(private configService: ApiConfigService) {}

  async test( provider: Provider): Promise<Provider> {
    let tokens = this.configService.getProvider(provider.providerName);
    const val = {
      client_id: tokens.clientID,
      client_secret: tokens.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: provider.refreshToken,
      redirect_uri: tokens.callbackURL,
      scope: provider.scopes.join(' '),
    };
    //FIXME: First check if accestoken is valid, then refresh

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
      if (!resp) {
        throw new Error('Discord gave no response');
      }

      provider.accessToken = resp.data.access_token;
      provider.refreshToken = resp.data.refresh_token;

      return provider;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
