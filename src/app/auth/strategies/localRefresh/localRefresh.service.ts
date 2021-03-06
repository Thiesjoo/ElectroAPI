import { AuthRole, RefreshTokenPayloadDTO } from 'src/models';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService, AuthUserService } from '../..';

/** Service for localrefresh controller */
@Injectable()
export class LocalRefreshService {
  /** Logger of this service */
  private logger = new Logger(LocalRefreshService.name);

  /** Constructor */
  constructor(
    private authService: AuthService,
    private authUsersService: AuthUserService,
    private jwtService: JwtService,
  ) {}

  /** Create a new accesstoken */
  async getAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    const payload = await this.getPayload(refreshToken);

    const result = await this.authService.verifyRefreshToken(payload);
    if (!result) {
      this.logger.warn(
        `Refresh token was not valid. User: ${payload.sub}. With token: ${payload.jti}`,
      );
      return '';
    }
    const newToken = await this.authService.createAccessToken(result);
    return newToken;
  }

  /** Revoke a specific token */
  async revokeToken(refreshToken: string) {
    const payload: RefreshTokenPayloadDTO = await this.getPayload(refreshToken);
    const user = await this.authService.verifyRefreshToken(payload);
    if (user) {
      await this.authUsersService.revokeUserToken(user._id, payload.jti);
    }
  }

  /**
   * Get the JWT payload of a token
   * @param token Refreshtoken from user
   */
  private async getPayload(token: string): Promise<RefreshTokenPayloadDTO> {
    const tokenPayload = (await this.jwtService.verifyAsync(
      token,
    )) as RefreshTokenPayloadDTO;

    //FIXME: Use type checking library for this
    if (
      tokenPayload.sub &&
      tokenPayload.rol &&
      tokenPayload.iat &&
      tokenPayload.exp &&
      tokenPayload.jti &&
      tokenPayload.rol !== AuthRole.Banned
    ) {
      return tokenPayload;
    }
    throw new UnauthorizedException('Token not valid');
  }
}
