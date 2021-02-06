import { Injectable, Logger } from '@nestjs/common';
import { RefreshTokenPayload } from 'src/models';
import { AuthService, AuthUserService } from '../..';

@Injectable()
export class RefreshService {
  private readonly logger = new Logger(RefreshService.name);

  constructor(private readonly authService: AuthService) {}

  async getAccessToken(refreshToken: string): Promise<string> {
    const result = await this.authService.verifyRefreshToken(
      await this.authService.getPayload(refreshToken),
    );
    if (!result) {
      this.logger.error('wtf');
      return '';
    }
    const newToken = await this.authService.createAccessToken(result);
    return newToken;
  }

  async revokeToken(refreshToken: string) {
    const payload: RefreshTokenPayload = await this.authService.getPayload(
      refreshToken,
    );
    console.log(payload);
    const user = await this.authService.verifyRefreshToken(payload, false);
    console.log(payload, user);
    if (user) {
      const token = user.tokens.find((x) => payload.jti === x.jti);
      console.log(token);
      token.revoked = true;
      await user.save();
    }
  }
}
