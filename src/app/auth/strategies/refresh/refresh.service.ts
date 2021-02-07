import { RefreshTokenPayload } from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService, AuthUserService } from '../..';

@Injectable()
export class RefreshService {
  private readonly logger = new Logger(RefreshService.name);

  constructor(
    private readonly authService: AuthService,
    private authUsersService: AuthUserService,
  ) {}

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
    const user = await this.authService.verifyRefreshToken(payload);
    if (user) {
      await this.authUsersService.revokeUserToken(user._id, payload.jti);
    }
  }
}
