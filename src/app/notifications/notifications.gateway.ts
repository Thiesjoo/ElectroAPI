import { Server, Socket } from 'socket.io';
import { AuthedUser, UserToken } from 'src/common';
import {
  AuthTokenPayloadDTO,
  ListenerType,
  messageNotificationMapper,
  ProviderDTO,
  ReturnTypeOfMethod,
  ServerEventEmitter,
} from 'src/models';
import {
  IngestClientDTO,
  NotificationSocketEventsDTO as Requ,
  NotificationSocketRoutes as Rout,
} from 'src/sockets';
import {
  applyDecorators,
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
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { AuthService, AuthUserService, JwtGuard } from '../auth';
import { LiveService } from '../live/live.service';
import { NotificationService } from '../notifications/notifications.service';

/** Service to handle WebSockets for notifications. */
@UsePipes(new ValidationPipe())
@WebSocketGateway()
@UseGuards(JwtGuard)
export class NotificationGateway {
  @WebSocketServer()
  server: Server;
  /** Map of every client, mapped to the data about client */
  private sendClients: Record<string, IngestClientDTO> = {};
  private receiveClients: Record<
    string,
    ServerEventEmitter<Socket, Requ>[]
  > = {};
  /** Logger of this service */
  private logger: Logger = new Logger(NotificationGateway.name);

  /** Setup auth related things */
  constructor(
    private authUserService: AuthUserService,
    private authService: AuthService,
    private notificationService: NotificationService,

    private liveService: LiveService,
  ) {
    liveService.init(this.broadcast.bind(this));
    // console.log(this.server);
  }

  @SecuritySockets(Rout.Test)
  async testing(
    @ConnectedSocket() socket: Socket,
    @UserToken() token: AuthTokenPayloadDTO,
  ) {
    // console.log(socket, token);
    return this.liveService.test(token?.sub);
  }

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
      const updatedProvider: ProviderDTO = await this.authService.refreshProvider(
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
    console.log(data);
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

    this.receiveClients[user._id] ??= [];
    this.receiveClients[user._id].push(client);

    return true;
  }

  /** Get the identity of a authed socket */
  @SecuritySockets(Rout.SendIdentity, 'send')
  async identity(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    ...[]: Parameters<Requ[Rout.SendIdentity]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.SendIdentity]>> {
    // this.checkSendPermissions(client, 'test');
    console.log('wooot');

    return this.sendClients[client.id];
  }

  /**
   * Simple ingest function
   */
  @SecuritySockets(Rout.Ingest, 'send')
  async ingestData(
    @ConnectedSocket() client: Socket,
    @UserToken() token: AuthTokenPayloadDTO,
    @MessageBody()
    ...[data]: Parameters<Requ[Rout.Ingest]>
  ): Promise<ReturnTypeOfMethod<Requ[Rout.Ingest]>> {
    //FIXME: Move this to a decorator?

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

  /** Broadcast a message to a specific user (Over multiple sockets). Also filter the disconnected sockets */
  broadcast<T extends keyof Requ>(
    user: string,
    channel: T,
    message: ListenerType<Requ[T]>,
  ) {
    this.receiveClients[user] = (this.receiveClients[user] || []).filter(
      (x) => !x.disconnected,
    );
    this.receiveClients[user].forEach((x) => {
      x.emit(channel, message);
    });
  }
}

/**
 * Decorator to check if the user has authenticated with the websocket api (Receiving and sending)
 */
function SocketPermissions(route: string, send: 'send' | 'receive') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function () {
      const firstArg = arguments[0] as Socket; // First arg SHOULD always be socket;
      if (!this[send + 'Clients'][firstArg.id]) {
        // console.log('hmmm', this[send + 'Clients'], firstArg.id);
        throw new WsException(new UnauthorizedException(route));
      }
      return originalMethod.apply(this, arguments);
    };
  };
}

function SecuritySockets(
  route: string,
  type: 'send' | 'receive' | 'none' = 'none',
) {
  const defaultArr = [SubscribeMessage(route), AuthedUser()];

  if (type !== 'none') defaultArr.unshift(SocketPermissions(route, type)); // This one has to be unshifted, because it changes the function

  return applyDecorators(...defaultArr);
}
