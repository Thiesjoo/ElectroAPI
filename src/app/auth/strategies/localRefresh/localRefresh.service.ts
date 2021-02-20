import { RefreshTokenPayload } from 'src/models';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService, AuthUserService } from '../..';

@Injectable()
export class LocalRefreshService {
  private logger = new Logger(LocalRefreshService.name);

  constructor(
    private authService: AuthService,
    private authUsersService: AuthUserService,
    private jwtService: JwtService,
  ) {}

  async getAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    const result = await this.authService.verifyRefreshToken(
      await this.getPayload(refreshToken),
    );
    if (!result) {
      this.logger.error('wtf');
      return '';
    }
    const newToken = await this.authService.createAccessToken(result);
    return newToken;
  }

  async revokeToken(refreshToken: string) {
    const payload: RefreshTokenPayload = await this.getPayload(refreshToken);
    const user = await this.authService.verifyRefreshToken(payload);
    if (user) {
      await this.authUsersService.revokeUserToken(user._id, payload.jti);
    }
  }

  /**
   * Get the JWT payload of a token
   * @param token Refreshtoken from user
   */
  private async getPayload(token: string): Promise<RefreshTokenPayload> {
    return await this.jwtService.verifyAsync(token);
  }
}
