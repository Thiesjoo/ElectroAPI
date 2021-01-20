import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { isEmail, isString } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email, password): Promise<any> {
    if (!isEmail(email) || !isString(password)) {
      throw new BadRequestException();
    }
    const token = await this.authService.validateUser(email, password);
    if (!token) {
      throw new UnauthorizedException();
    }
    return token;
  }
}
