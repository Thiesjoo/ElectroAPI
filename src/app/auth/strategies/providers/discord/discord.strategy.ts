import { Request } from 'express';
import { Strategy } from 'passport-discord';
import { AuthService } from 'src/app/auth/auth.service';
import { extractUid } from 'src/common';
import { ApiConfigService } from 'src/config/configuration';
import { AuthProviders } from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import discordMapper from './discord.mapper';
import { DiscordUser } from './discord.types';

/** Scopes needed for discord API */
const dcScopes = ['identify', 'connections', 'rpc', 'rpc.notifications.read'];

/** The discord strategy */
@Injectable()
export class DiscordStrategy extends PassportStrategy(
  Strategy,
  AuthProviders.Discord,
) {
  /** Logger for this service */
  private logger: Logger = new Logger(DiscordStrategy.name);

  /** Discord Strat setup */
  constructor(
    private authService: AuthService,
    configService: ApiConfigService,
  ) {
    super({
      ...configService.getProvider(AuthProviders.Discord),
      scope: dcScopes,
      passReqToCallback: true,
    });
  }

  /** Validate a login request */
  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: DiscordUser,
  ): Promise<void> {
    const done: (err: any, profile: {} | false) => void =
      arguments[arguments.length - 1];
    try {
      this.logger.debug(`Discord login from user: ${profile.username}`);

      const prov = discordMapper(accessToken, refreshToken, profile, dcScopes);
      await this.authService.validateProvider(prov, extractUid(req));
      done(null, {});
    } catch (e) {
      done(e, null);
    }
  }
}
