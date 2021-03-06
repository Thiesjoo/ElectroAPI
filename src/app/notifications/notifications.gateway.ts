import { Socket } from 'socket.io';
import { AuthedUser, UserToken } from 'src/common';
import {
  AuthTokenPayloadDTO,
  ListenerType,
  messageNotificationMapper,
  Provider,
  ReturnTypeOfMethod,
  ServerEventEmitter,
} from 'src/models';
import {
  IngestClientDTO,
  NotificationSocketEventsDTO as Eve,
  NotificationSocketRequestsDTO as Requ,
  NotificationSocketRoutes as Rout,
} from 'src/sockets';
import {
  BadRequestException,
  Logger,
  NotFoundException,
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
  WsException,
} from '@nestjs/websockets';
import { AuthService, AuthUserService, JwtGuard } from '../auth';
import { NotificationService } from '../notifications/notifications.service';

/** Service to handle WebSockets for notifications. */
@UsePipes(new ValidationPipe())
@WebSocketGateway()
@UseGuards(JwtGuard)
export class NotificationGateway {
  /** Map of every client, mapped to the data about client */
  private sendClients: Record<string, IngestClientDTO> = {};
  private receiveClients: Record<string, ServerEventEmitter<Socket, Eve>> = {};
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
  @SubscribeMessage(Rout.AuthSend)
  async authSend(
    @ConnectedSocket() client: Socket,
    @UserToken() token: AuthTokenPayloadDTO,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.AuthSend]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.AuthSend]>> {
    if (token.sub !== data.id) {
      throw new WsException(
        new UnauthorizedException('JWT And user ID do not match'),
      );
    }

    this.logger.log('Received AUTH SEND request on socket gateway');

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
      this.logger.debug(
        `Successfully got provider for user ${updatedProvider.username}`,
      );
    } catch (e) {
      this.logger.error(e);
      return null;
    }

    this.sendClients[client.id] = {
      userUid: data.id,
      dataProvider: data.provider,
    };

    return foundProvider;
  }

  @AuthedUser()
  @SubscribeMessage(Rout.AuthReceive)
  async authReceive(
    @ConnectedSocket() client: Socket,
    @UserToken() token: AuthTokenPayloadDTO,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.AuthReceive]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.AuthReceive]>> {
    if (token.sub !== data) {
      throw new WsException(
        new UnauthorizedException('JWT And user ID do not match'),
      );
    }

    this.logger.debug('Received AUTH RECEIVE request on socket gateway');
    const user = await this.authUserService.findUserByUid(data);
    if (!user) {
      throw new WsException(new NotFoundException('User was not found'));
    }

    this.receiveClients[user._id] = client;

    return true;
  }

  /** Get the identity of a authed socket */
  @AuthedUser()
  @SubscribeMessage(Rout.Identity)
  async identity(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    ...[]: Parameters<Requ[Rout.Identity]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.Identity]>> {
    if (!this.sendClients[client.id]) {
      throw new WsException(new UnauthorizedException());
    }

    return this.sendClients[client.id];
  }

  /**
   * Simple ingest function
   */
  @AuthedUser()
  @SubscribeMessage(Rout.Ingest)
  async ingestData(
    @ConnectedSocket() client: Socket,
    @UserToken() token: AuthTokenPayloadDTO,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.Ingest]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.Ingest]>> {
    //FIXME: Move this to a decorator?
    if (!this.sendClients[client.id]) {
      throw new WsException(new UnauthorizedException());
    }

    this.logger.debug(`Ingest: received data`);

    return messageNotificationMapper(
      await this.notificationService.add(token, {
        ...data,
        providerType: this.sendClients[client.id].dataProvider,
      }),
    );
  }

  /** Get data. Client doesn't have to be authed with this.client, because notifications can be accessed via API also */
  @AuthedUser()
  @SubscribeMessage(Rout.GetSample)
  async getData(
    @ConnectedSocket() client: Socket,
    @UserToken() token: AuthTokenPayloadDTO,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.GetSample]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.GetSample]>> {
    this.logger.debug('Request data: ', data);
    return messageNotificationMapper(
      await this.notificationService.getWithID(token, data),
    );
  }

  broadcast<T extends keyof Eve>(
    user: string,
    channel: T,
    message: ListenerType<Eve[T]>,
  ) {
    if (!this.receiveClients[user]) {
      throw new WsException(
        new UnauthorizedException('User has not authenticated with our API'),
      );
    }
    this.receiveClients[user].emit(channel, message);
  }
}
