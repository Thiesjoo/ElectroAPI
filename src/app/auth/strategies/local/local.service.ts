import { AuthUserService } from 'src/app';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';

/** Service for registering users*/
@Injectable()
export class LocalAuthService {
  /** Constructor */
  constructor(
    private authUsersService: AuthUserService,
    private authService: AuthService,
  ) {}

  /** Register a user with the authservice */
  async register(name: string, email: string, password: string) {
    const user = await this.authUsersService.createUser(
      { name, email },
      password,
    );

    return await this.authService.generateTokens(user);
  }
}
