import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuthProviders,
  AuthTokenPayload,
  IUser,
  Provider,
  User,
} from 'src/models';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthUserService } from './auth.user.service';

@Injectable()
export class AuthService {
  constructor(
    private authUsersService: AuthUserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocalUser(email: string, pass: string): Promise<string> {
    const user = await this.authUsersService.findUserByEmail(email);
    if (user && user.password === pass) {
      return this.createToken(user);
    }
    return null;
  }

  async validateProvider(
    providerData: Provider,
    userUid: string,
  ): Promise<string> {
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
    return await this.createToken(user);
  }

  /**
   * Signs a new JWT token for the user provided
   * @param user User the token has to be created for
   */
  private createToken(user: IUser): Promise<string> {
    if (!user) return null;
    const { id, role } = user;
    const payload: AuthTokenPayload = {
      sub: id,
      rol: role,
    };
    return this.jwtService.signAsync(payload);
  }

  /**
   * Check if the payload of the token provided matches with the database records
   * @param {AuthTokenPayload} payload The payload of the token provided by the user
   */
  private async verifyClaims(payload: AuthTokenPayload): Promise<User> {
    try {
      if (!payload?.sub) return null;
      const user = await this.authUsersService.findUserByUid(payload.sub);

      return !!user && user.id === payload.sub && user.role === payload.rol
        ? user
        : null;
    } catch (e) {
      throw new ForbiddenException(
        'An error occured while verifying your claims',
        e?.message,
      );
    }
  }

  async verifyToken(payload: AuthTokenPayload): Promise<string | boolean> {
    const user = await this.verifyClaims(payload);
    if (!user) return null;

    const exp = payload?.exp;

    if (Date.now() < exp * 1000) {
      return true;
    }
    let promises: Array<Promise<boolean>> = user.providers.map((x) => {
      //TODO: Refresh all providers
      return new Promise((done) => {
        done(true);
      });
    });
    await Promise.all(promises);

    return await this.createToken(user);
  }
}
