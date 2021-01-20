import { Strategy } from 'passport-discord';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { ApiConfigService } from 'src/config/configuration';
import { AuthProviders } from 'src/models';

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
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: DiscordUser,
  ): Promise<void> {
    const done: (err: any, profile: any | false) => void =
      arguments[arguments.length - 1];

    console.log(accessToken, refreshToken, profile, done);
  }
}
