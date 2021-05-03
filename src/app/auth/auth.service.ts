import { compare } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { ApiConfigService } from 'src/config/configuration';
import {
  AuthTokenPayloadDTO,
  IUser,
  ProviderDTO,
  RefreshTokenPayloadDTO,
  Tokens,
  User,
} from 'src/models';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Oauth2RefreshService } from './auth-refresh.service';
import { AuthUserService } from './user/auth.user.service';

/** Service too handle everything to do with Auth */
@Injectable()
export class AuthService {
  /** Constructor */
  constructor(
    private authUsersService: AuthUserService,
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private refreshService: Oauth2RefreshService,
  ) {}

  /**
   * Authenticate a local user
   * @param email Email of the user
   * @param pass Pass of the user
   */
  async validateLocalUser(email: string, pass: string): Promise<Tokens> {
    const user = await this.authUsersService.findUserByEmail(email);
    if (user) {
      const passwordComp = await compare(pass, user.password);
      if (!passwordComp) {
        return null;
      }
      return this.generateTokens(user);
    }
    return null;
  }

  /**
   * Validate a provider and push it to a user
   * @param providerData Data about provider
   * @param userUid User Uid
   */
  async validateProvider(
    providerData: ProviderDTO,
    userUid: string,
  ): Promise<void> {
    const user = await this.authUsersService.findUserByUid(userUid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const prov = user.providers.findIndex(
      (x) =>
        providerData.id === x.id &&
        providerData.providerName === x.providerName,
    );

    if (prov > -1) {
      console.log('Found existing provider: ', prov, providerData);
      user.providers[prov] = providerData;
      user.providers[prov].username = 'cringe';
    } else {
      user.providers.push(providerData);
    }
    user.markModified('providers');
    console.log(
      'User pre: ',
      await this.authUsersService.findUserByUid(user._id),
    );
    await user.save();

    console.log('User post: ', user);
    //TODO: Emit user update event(To get extra data from provider)

    return;
  }

  /** Refresh the accesstoken from a provider
   * @param userUid Id of user
   * @param provider Provider in question
   */
  async refreshProvider(
    userUid: string,
    provider: ProviderDTO,
  ): Promise<ProviderDTO> {
    const result = await this.refreshService.refreshTokens(provider);
    if (!result) {
      throw new InternalServerErrorException(
        'Something went wrong with refreshing user tokens',
      );
    }
    await this.validateProvider(provider, userUid);
    return result;
  }

  /**
   * Verify the claims of the user and check if the refreshtoken is not revoked. (Also remove all tokens that were revoked)
   * @param payload Refresh token payload
   */
  async verifyRefreshToken(payload: RefreshTokenPayloadDTO): Promise<User> {
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

  /** Generate access and refresh tokens for a user */
  async generateTokens(user: User): Promise<Tokens> {
    return {
      access: await this.createAccessToken(user),
      refresh: await this.createRefreshToken(user),
    };
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

    const payload: RefreshTokenPayloadDTO = {
      sub: id,
      rol: role,
      jti: token,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.expiry.refreshExpiry / 1000,
    });
  }

  /**
   * Signs a new JWT token for the user provided
   * @param user User the token has to be created for
   */
  createAccessToken(user: IUser): Promise<string> {
    if (!user) return null;
    const { id, role } = user;
    const payload: AuthTokenPayloadDTO = {
      sub: id,
      rol: role,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.expiry.accessExpiry / 1000,
    });
  }

  /**
   * Check if the payload of the token provided matches with the database records
   * @param {AuthTokenPayloadDTO} payload The payload of the token provided by the user
   */
  private async verifyPermissionClaims(
    payload: RefreshTokenPayloadDTO,
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
}
