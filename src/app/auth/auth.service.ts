import { randomBytes } from 'crypto';
import { ApiConfigService } from 'src/config/configuration';
import {
  AuthTokenPayload,
  IUser,
  Provider,
  RefreshTokenPayload,
  User
} from 'src/models';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUserService } from './auth.user.service';

@Injectable()
export class AuthService {
  constructor(
    private authUsersService: AuthUserService,
    private readonly jwtService: JwtService,
    private configService: ApiConfigService,
  ) {}

  async validateLocalUser(
    email: string,
    pass: string,
  ): Promise<{ access: string; refresh: string }> {
    const user = await this.authUsersService.findUserByEmail(email);
    if (user && user.password === pass) {
      return {
        access: await this.createAccessToken(user),
        refresh: await this.createRefreshToken(user),
      };
    }
    return null;
  }

  async validateProvider(
    providerData: Provider,
    userUid: string,
  ): Promise<void> {
    const user = await this.authUsersService.findUserByUid(userUid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let prov = user.providers.find(
      (x) =>
        providerData.id === x.id &&
        providerData.providerName === x.providerName,
    );

    if (prov) {
      prov = providerData;
    } else {
      user.providers.push(providerData);
    }
    user.save();
    //TODO: Emit user update event (Also make sure refresh tokens work?)

    console.log('validate provider: ', user);
    return;
  }

  /**
   * Signs a new JWT token for the user provided
   * @param user User the token has to be created for
   */
  createAccessToken(user: IUser): Promise<string> {
    if (!user) return null;
    const { id, role } = user;
    const payload: AuthTokenPayload = {
      sub: id,
      rol: role,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.expiry.accessExpiry,
    });
  }

  /**
   * Signs a new JWT token for the user provided
   * @param user User the token has to be created for
   */
  private createRefreshToken(user: User): Promise<string> {
    if (!user) return null;
    const { id, role } = user;
    const token = randomBytes(20).toString('hex');

    user.tokens.push({
      jti: token,
      expires: Date.now() + this.configService.expiry.refreshExpiry,
      revoked: false,
    });
    user.save();

    const payload: RefreshTokenPayload = {
      sub: id,
      rol: role,
      jti: token,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.expiry.refreshExpiry,
    });
  }

  /**
   * Check if the payload of the token provided matches with the database records
   * @param {AuthTokenPayload} payload The payload of the token provided by the user
   */
  private async verifyPermissionClaims(
    payload: RefreshTokenPayload,
  ): Promise<User> {
    try {
      if (!payload?.sub) return null;
      const user = await this.authUsersService.findUserByUid(payload.sub);

      if (!(!!user && user.id === payload.sub && user.role === payload.rol)) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (e) {
      throw new ForbiddenException(
        'An error occured while verifying your claims',
        e?.message,
      );
    }
  }

  /**
   * Verify the claims of the user and check if the refreshtoken is not revoked. (Also remove all tokens that were revoked)
   * @param payload Refresh token payload
   */
  async verifyRefreshToken(payload: RefreshTokenPayload): Promise<User> {
    const user = await this.verifyPermissionClaims(payload);
    user.tokens = user.tokens.filter(
      (x) => !x.revoked && x.expires > Date.now(),
    );

    const matchingToken = user.tokens.find((x) => x.jti === payload.jti);
    if (!matchingToken) {
      throw new UnauthorizedException();
    }

    // Save the modified tokens
    await user.save();
    return user;
  }

  /**
   * Get the JWT payload of a token
   * @param token Refreshtoken from user
   */
  async getPayload(token: string): Promise<RefreshTokenPayload> {
    return await this.jwtService.verifyAsync(token);
  }
}
