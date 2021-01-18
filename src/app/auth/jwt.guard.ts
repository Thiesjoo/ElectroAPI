import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthRole, AuthTokenPayload } from '../../models/';
import { AuthService } from './auth.service';
import { enumValues } from 'src/utils';
const roleOrder = enumValues(AuthRole);

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpctx: HttpArgumentsHost = context.switchToHttp();
    const request: Request = httpctx.getRequest();
    const token: string =
      ExtractJwt.fromAuthHeaderAsBearerToken()(request) ||
      ExtractJwt.fromUrlQueryParameter('auth')(request);

    if (!token) {
      throw new UnauthorizedException(
        'No authorization token has been provided',
      );
    }

    const payload: AuthTokenPayload = this.jwtService.verify(token, {
      ignoreExpiration: true,
    });
    if (!payload) {
      throw new UnauthorizedException(
        'No authorization token has been provided',
      );
    }

    request.user = payload;
    // Check claims, but don't verify them yet
    //TOOD: Check is this works
    const role = this.reflector.get<AuthRole>('roles', context.getHandler());
    const roleIndex = roleOrder.indexOf(role);

    if (
      role &&
      payload?.rol &&
      roleIndex &&
      roleIndex > roleOrder.indexOf(payload.rol)
    ) {
      throw new ForbiddenException("You're not allowed to execute this");
    }

    const newToken = await this.authService.verifyToken(payload);
    if (typeof newToken === 'boolean' || newToken === null) {
      return !!newToken;
    }
    const response: Response = httpctx.getResponse();
    response.setHeader('X-Access-Token', newToken);
    response.setHeader('Access-Control-Expose-Headers', 'X-Access-Token');
    return true;
  }
}
