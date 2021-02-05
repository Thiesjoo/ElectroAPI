import { Strategy } from 'passport-discord';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { ApiConfigService } from 'src/config/configuration';
import { AuthProviders, Provider } from 'src/models';
import { Request } from 'express';
import { extractUID } from 'src/utils';

@Injectable()
export class DiscordStrategy extends PassportStrategy(
  Strategy,
  AuthProviders.Discord,
) {
  constructor(
    private authService: AuthService,
    configService: ApiConfigService,
  ) {
    super({
      ...configService.provider(AuthProviders.Discord),
      scope: ['identify', 'connections', 'rpc', 'rpc.notifications.read'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: DiscordUser,
  ): Promise<void> {
    const done: (err: any, profile: { jwt: string } | false) => void =
      arguments[arguments.length - 1];
    try {
      const prov: Provider = {
        providerName: AuthProviders.Discord,
        id: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        accessToken,
        refreshToken,
        extra: {
          discriminator: profile.discriminator,
          connections: profile.connections,
        },
      };

      done(null, {
        jwt: await this.authService.validateProvider(prov, extractUID(req)),
      });
    } catch (e) {
      done(e, null);
    }
  }
}
