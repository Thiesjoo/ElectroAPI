import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { AuthedUser, UserToken } from 'src/common';
import { corsSettings } from 'src/config/configuration';
import {
  AuthTokenPayload,
  IngestClient,
  NotificationSocketRequests as Requ,
  NotificationSocketRoutes as Rout,
  Provider,
  ReturnTypeOfMethod
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
import { NotificationService } from '../notifications/notifications.service';

/** Service to handle WebSockets for notifications. */
@UsePipes(new ValidationPipe())
//TODO: THis doesnt' work in socket.io v3.
@WebSocketGateway(null, {
  cors: corsSettings,
})
@UseGuards(JwtGuard)
export class NotificationGateway {
  /** The websocket server */
  @WebSocketServer()
  server: Server;
  /** Map of every client, mapped to the data about client */
  private clients: Record<string, IngestClient> = {};
  /** Logger of this service */
  private logger: Logger = new Logger(NotificationGateway.name);

  /** Setup auth related things */
  constructor(
    private authUserService: AuthUserService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Check if client can authenticate and act on that
   * @param client Client socket
   * @param token Client processed token
   * @param data Data from request
   */
  @AuthedUser()
  @SubscribeMessage(Rout.Auth)
  async auth(
    @ConnectedSocket() client: Socket,
    @UserToken() token: AuthTokenPayload,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.Auth]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.Auth]>> {
    if (token.sub !== data.id) {
      throw new WsException(
        new UnauthorizedException('JWT And user ID do not match'),
      );
    }

    this.logger.log('Received AUTH request on socket gateway');

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
        new BadRequestException(
          'Provider not registered on this users account',
        ),
      );
    }

    try {
      const updatedProvider: Provider = await this.authService.refreshProvider(
        user._id,
        foundProvider,
      );
      this.logger.log(
        `Successfully got provider for user ${updatedProvider.username}`,
      );
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

  /** Get the identity of a authed socket */
  @AuthedUser()
  @SubscribeMessage(Rout.Identity)
  async identity(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    ...[]: Parameters<Requ[Rout.Identity]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.Identity]>> {
    if (!this.clients[client.id]) {
      throw new WsException(new UnauthorizedException());
    }

    return this.clients[client.id];
  }

  /** TODO: Make this
   * Simple ingest function
   */
  @AuthedUser()
  @SubscribeMessage(Rout.Ingest)
  async ingestData(
    @ConnectedSocket() client: Socket,
    @Req() req: Request,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.Ingest]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.Ingest]>> {
    console.log(data);
    return true;
  }

  /** Get data */
  @AuthedUser()
  @SubscribeMessage(Rout.GetSample)
  async getData(
    @ConnectedSocket() client: Socket,
    @Req() req: Request,
    @UserToken() token: AuthTokenPayload,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.GetSample]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.GetSample]>> {
    console.log(data);
    return this.notificationService.getWithID(token, data);
  }
}
