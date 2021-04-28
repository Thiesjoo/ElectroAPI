import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import { AuthNames } from 'src/models';
import { UserLoginDTO } from 'src/models/dto/user.login.dto';
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
    const userData = new UserLoginDTO();
    userData.email = email;
    userData.password = password;

    const res = await validate(userData, {
      validationError: { target: false },
    });

    if (res.length > 0) {
      throw new BadRequestException(res);
    }
    const token = await this.authService.validateLocalUser(email, password);
    if (!token?.access || !token?.refresh) {
      throw new UnauthorizedException();
    }

    return token;
  }
}
