import { isEmail, isString } from 'class-validator';
import { Strategy } from 'passport-local';
import { AuthNames } from 'src/models';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../auth.service';

/** The local Strategy */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AuthNames.Local) {
  /** Edit username field */
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /** Validate request inside function, because authguard comes before validation */
  async validate(
    email: string,
    password: string,
  ): Promise<{ access: string; refresh: string }> {
    if (!isEmail(email) || !isString(password)) {
      throw new BadRequestException();
    }
    const token = await this.authService.validateLocalUser(email, password);
    if (!token?.access || !token?.refresh) {
      throw new UnauthorizedException();
    }

    return token;
  }
}
