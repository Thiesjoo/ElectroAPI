import {
  BadRequestException,
  NotFoundException,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import {
  AuthedUser,
  AuthProviders,
  DeveloperOnly,
  IngestClient,
  IngestSocketRoutes,
  Provider,
} from 'src/models';
import { extractUID } from 'src/utils';
import { AuthUserService, JwtGuard } from '../auth';
import { IngestAuthDTO } from './ingest.dto';

@UsePipes(new ValidationPipe())
@WebSocketGateway()
@UseGuards(JwtGuard)
export class IngestGateway {
  @WebSocketServer()
  server: Server;
  private readonly clients: Record<string, IngestClient> = {};

  constructor(private readonly authUserService: AuthUserService) {}

  @AuthedUser()
  @SubscribeMessage(IngestSocketRoutes.Auth)
  async auth(
    @ConnectedSocket() client: Socket,
    @Req() req: Request,
    @MessageBody() data: IngestAuthDTO,
  ): Promise<Provider> {
    if (extractUID(req) !== data.id) {
      throw new WsException(
        new UnauthorizedException('JWT And user ID do not match'),
      );
    }
    //FIXME: Check if authorized client application (Maybe a toggle to disable all)

    const user = await this.authUserService.findUserByUid(data.id);
    if (!user) {
      throw new WsException(new NotFoundException('User was not found'));
    }

    const foundProvider = user.providers.find(
      (x) => x.providerName === data.provider,
    );
    if (!foundProvider) {
      throw new WsException(
        new BadRequestException('Provider not registerd on this users account'),
      );
    }
    return foundProvider;
  }

  @SubscribeMessage(IngestSocketRoutes.Identity)
  async identity(@ConnectedSocket() client: Socket): Promise<IngestClient> {
    if (!this.clients[client.id]) {
      throw new WsException(new UnauthorizedException());
    }

    return this.clients[client.id];
  }
}
