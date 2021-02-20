import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { UserToken } from 'src/common/decorators/user';
import {
  AuthedUser,
  AuthTokenPayload,
  IMessageNotification,
  IngestClient,
  IngestSocketRoutes,
  Provider
} from 'src/models';
import {
  BadRequestException,
  Logger,
  NotFoundException,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { AuthService, AuthUserService, JwtGuard } from '../auth';
import { IngestAuthDTO } from './ingest.dto';

@UsePipes(new ValidationPipe())
@WebSocketGateway()
@UseGuards(JwtGuard)
export class IngestGateway {
  @WebSocketServer()
  server: Server;
  private readonly clients: Record<string, IngestClient> = {};
  private readonly logger: Logger = new Logger(IngestGateway.name);

  constructor(
    private readonly authUserService: AuthUserService,
    private readonly authService: AuthService,
  ) {}

  @AuthedUser()
  @SubscribeMessage(IngestSocketRoutes.Auth)
  async auth(
    @ConnectedSocket() client: Socket,
    @UserToken() token: AuthTokenPayload,
    @MessageBody() data: IngestAuthDTO,
  ): Promise<Provider> {
    if (token.sub !== data.id) {
      throw new WsException(
        new UnauthorizedException('JWT And user ID do not match'),
      );
    }
    //FIXME: Check if authorized client application (Maybe a toggle to disable all)
    //FIXME: Verify origin

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

    try {
      const updatedProvider: Provider = await this.authService.refreshProvider(
        user._id,
        foundProvider,
      );
      this.logger.log(updatedProvider);
    } catch (e) {
      this.logger.error(e);
      return null;
    }

    this.clients[client.id] = {
      userUid: data.id,
      dataProvider: data.provider,
    };

    return foundProvider;
  }

  @AuthedUser()
  @SubscribeMessage(IngestSocketRoutes.Identity)
  async identity(@ConnectedSocket() client: Socket): Promise<IngestClient> {
    if (!this.clients[client.id]) {
      throw new WsException(new UnauthorizedException());
    }

    return this.clients[client.id];
  }

  @AuthedUser()
  @SubscribeMessage(IngestSocketRoutes.Ingest)
  async ingestData(
    @ConnectedSocket() client: Socket,
    @Req() req: Request,
    @MessageBody() data: IMessageNotification,
  ) {
    console.log(data);
  }
}
