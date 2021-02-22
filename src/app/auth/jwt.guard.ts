import { Request } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import { Socket } from 'socket.io';
import { ApiConfigService } from 'src/config/configuration';
import { enumValues } from 'src/utils';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { AuthRole, AuthTokenPayload } from '../../models';

/** Order of roles in our application */
const roleOrder = enumValues(AuthRole);

/**
 * JwtGuard grabs the auth token from:
 * - URL query parameter: auth
 * - The Authorization header
 * - From 'accesstoken' cookie.
 * It then checks it validity and sets the payload as request.user
 */
@Injectable()
export class JwtGuard implements CanActivate {
  /** Setup routes and config service */
  constructor(
    private reflector: Reflector,
    private configService: ApiConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Executed on every request
   * @param context Context of every request
   */
  async canActivate(context: ExecutionContext): Promise<boolean | any> {
    try {
      const httpctx: HttpArgumentsHost = context.switchToHttp();
      const request: Request = httpctx.getRequest();
      switch (context.getType()) {
        case 'ws':
          const client: Socket = context.switchToWs().getClient<Socket>();

          let wsToken = client.handshake?.auth?.token as string;
          if (!wsToken) {
            const params = client.handshake?.headers?.cookie
              ?.split(';')
              ?.reduce((res, c) => {
                const [key, val] = c.trim().split('=').map(decodeURIComponent);
                try {
                  return Object.assign(res, { [key]: JSON.parse(val) });
                } catch (e) {
                  return Object.assign(res, { [key]: val });
                }
              }, {});
            console.log(client.handshake.headers);

            wsToken = params?.[this.configService.cookieNames.access];
          }

          const processedWS = await this.processToken(wsToken, context);
          request.user = processedWS;
          return true;

        case 'http':
          let httpToken =
            ExtractJwt.fromUrlQueryParameter('auth')(request) ||
            ExtractJwt.fromAuthHeaderAsBearerToken()(request) ||
            request.cookies[this.configService.cookieNames.access];

          const processed = await this.processToken(httpToken, context);

          request.user = processed;
          return true;
        default:
          return false;
      }
    } catch (e) {
      let error = e;
      if (e instanceof JsonWebTokenError) {
        error = new UnauthorizedException(
          'No valid authorization token has been provided',
        );
      }
      if (context.getType() === 'ws') {
        throw new WsException(error);
      }
      throw error;
    }
  }

  /**
   * Process a JWT token by checking if token is valid and if role is valid
   * @param token the JWT token
   * @param context The context of the request
   */
  async processToken(
    token: string,
    context: ExecutionContext,
  ): Promise<AuthTokenPayload> {
    if (!token) {
      throw new UnauthorizedException(
        'No authorization token has been provided',
      );
    }

    // Verify token: WITH EXPIRY
    const payload: AuthTokenPayload = this.jwtService.verify(token);
    if (!payload) {
      throw new UnauthorizedException(
        'No valid authorization token has been provided',
      );
    }

    // Get role from the decorator of the route or the decorator of the class
    const role =
      this.reflector.get<AuthRole>('roles', context.getHandler()) ||
      this.reflector.get('roles', context.getClass());

    const roleIndex = roleOrder.indexOf(role);
    if (!(role && payload?.rol)) {
      throw new InternalServerErrorException(
        'Something went wrong with JWT role check',
      );
    }

    // Check permissions
    if (
      role &&
      payload?.rol &&
      roleIndex &&
      roleIndex > roleOrder.indexOf(payload.rol)
    ) {
      throw new ForbiddenException("You're not allowed to execute this");
    }

    return payload;
  }
}
