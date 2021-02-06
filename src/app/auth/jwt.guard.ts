import { Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import { Socket } from 'socket.io';
import { enumValues } from 'src/utils';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthRole, AuthTokenPayload } from '../../models';
import { AuthService } from './auth.service';
import { ApiConfigService } from 'src/config/configuration';

const roleOrder = enumValues(AuthRole);

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private configService: ApiConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean | any> {
    try {
      const httpctx: HttpArgumentsHost = context.switchToHttp();
      const request: Request = httpctx.getRequest();
      switch (context.getType()) {
        case 'ws':
          const client: Socket = context.switchToWs().getClient<Socket>();
          let wsToken: string = client.handshake?.query?.token as string;
          const processedWS = await this.processToken(
            wsToken,
            context.getHandler(),
          );
          request.user = processedWS;
          return true;

        case 'http':
          let httpToken =
            ExtractJwt.fromUrlQueryParameter('auth')(request) ||
            ExtractJwt.fromAuthHeaderAsBearerToken()(request) ||
            request.cookies[this.configService.cookieNames.access];

          const processed = await this.processToken(
            httpToken,
            context.getHandler(),
          );

          request.user = processed;
          return true;
        default:
          return false;
      }
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new BadRequestException(
          'No valid authorization token has been provided',
        );
      }
      throw e;
    }
  }

  async processToken(
    token: string,
    ctxHandler: Function,
  ): Promise<AuthTokenPayload> {
    if (!token) {
      throw new UnauthorizedException(
        'No authorization token has been provided',
      );
    }

    const payload: AuthTokenPayload = this.jwtService.verify(token);
    if (!payload) {
      throw new UnauthorizedException(
        'No authorization token has been provided',
      );
    }

    //TODO: Check if this works

    // Check claims, but don't verify them yet
    const role = this.reflector.get<AuthRole>('roles', ctxHandler);
    const roleIndex = roleOrder.indexOf(role);

    if (!(role && payload?.rol)) {
      throw new InternalServerErrorException(
        'Something went wrong with JWT role check',
      );
    }

    if (
      role &&
      payload?.rol &&
      roleIndex &&
      roleIndex > roleOrder.indexOf(payload.rol)
    ) {
      throw new ForbiddenException("You're not allowed to execute this");
    }

    const verifyResult = await this.authService.verifyToken(payload);
    if (!verifyResult) {
      throw new UnauthorizedException(
        "User not found/Provider refreshing wasn't working",
      );
    }
    return payload;
  }
}
