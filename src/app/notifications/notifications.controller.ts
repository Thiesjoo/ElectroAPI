import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiPaginatedResponse,
  AuthedUser,
  AuthPrefixes,
  ResponsePrefix,
} from 'src/common';
import { UserToken } from 'src/common/decorators/user';
import {
  AuthTokenPayloadDTO,
  CreateMessageNotificationDTO,
  DeleteMessageNotificationDTO,
  MessageNotificationDTO,
  messageNotificationMapper,
  PaginatedDTO,
  PaginatedRequestDTO,
  UpdateMessageNotificationDTO,
} from 'src/models';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth';
import { NotificationService } from './notifications.service';

class SimpleOK {
  @ApiProperty({ type: Boolean })
  ok: boolean;
}

/** Service to handle REST for notifications */
@Controller('api/notifications')
@ResponsePrefix()
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('Notification')
// For paginated requests
@ApiExtraModels(MessageNotificationDTO)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /** Get notifications paginated */
  @Get('')
  @ApiPaginatedResponse(MessageNotificationDTO)
  @UsePipes(new ValidationPipe({ transform: true }))
  getPaginated(
    @UserToken() token: AuthTokenPayloadDTO,
    @Query() request: PaginatedRequestDTO,
  ): Observable<PaginatedDTO<MessageNotificationDTO>> {
    return from(this.notificationService.getPaginated(token, request)).pipe(
      map((x) => {
        return {
          docs: x?.docs.map(messageNotificationMapper),
          page: x?.page,
          limit: x?.limit,
          totalDocs: x?.totalDocs,
          totalPages: x?.totalPages,
        };
      }),
    );
  }

  /** Add a notification to the database */
  @Post('')
  @ApiBody({
    type: CreateMessageNotificationDTO,
    description: 'A complete notification object',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MessageNotificationDTO,
    description: 'The new notification',
  })
  createNotification(
    @UserToken() token: AuthTokenPayloadDTO,
    @Body() notf: CreateMessageNotificationDTO,
  ): Observable<MessageNotificationDTO> {
    return from(this.notificationService.add(token, notf)).pipe(
      map(messageNotificationMapper),
    );
  }

  /** Get notification with ID */
  @Get(':id/')
  @ApiResponse({
    status: HttpStatus.OK,
    type: MessageNotificationDTO,
    description: 'The requested notification',
  })
  getWithID(
    @Param('id') id: string,
    @UserToken() token: AuthTokenPayloadDTO,
  ): Observable<MessageNotificationDTO> {
    return from(this.notificationService.getWithID(token, id)).pipe(
      map(messageNotificationMapper),
    );
  }

  @Get(':id/filtered')
  @ApiResponse({
    status: HttpStatus.OK,
    type: SimpleOK,
    description: 'The requested notification',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getWithIDFiltered(
    @Param('id') id: string,
    @UserToken() token: AuthTokenPayloadDTO,
    @Query() request: PaginatedRequestDTO,
  ): Promise<{ ok: boolean }> {
    return {
      ok: await this.notificationService.getWithIDFiltered(token, id, request),
    };
  }

  /** Add a notification to the database */
  @Patch(':id/')
  @ApiBody({
    type: UpdateMessageNotificationDTO,
    description: 'A complete notification object',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MessageNotificationDTO,
    description: 'The new notification',
  })
  updateWithId(
    @UserToken() token: AuthTokenPayloadDTO,
    @Param('id') id: string,
    @Body() notf: UpdateMessageNotificationDTO,
  ): Observable<MessageNotificationDTO> {
    return from(this.notificationService.update(token, id, notf)).pipe(
      map(messageNotificationMapper),
    );
  }
  /** Get notification with ID */
  @Delete(':id/')
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteMessageNotificationDTO,
  })
  removeWithId(
    @Param('id') id: string,
    @UserToken() token: AuthTokenPayloadDTO,
  ): Observable<DeleteMessageNotificationDTO> {
    return from(this.notificationService.remove(token, id));
  }
}
