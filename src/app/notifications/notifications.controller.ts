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
  AuthTokenPayload,
  PaginatedDTO,
  PaginatedRequestDTO,
} from 'src/models';
import {
  MessageNotificationDTO,
  messageNotificationMapper,
} from 'src/models/dto/message-notification.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth';
import { NotificationService } from './notifications.service';

/** Service to handle REST for notifications */
@Controller('api/notifications')
@ResponsePrefix()
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('Notification')
// For paginated requests
@ApiExtraModels(MessageNotificationDTO)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /** Get notification with ID */
  @Get(':id/')
  @ApiResponse({
    status: HttpStatus.OK,
    type: MessageNotificationDTO,
    description: 'The requested notification',
  })
  getWithId(
    @Param('id') id: string,
    @UserToken() token: AuthTokenPayload,
  ): Observable<MessageNotificationDTO> {
    return from(this.notificationService.getWithID(token, id)).pipe(
      map(messageNotificationMapper),
    );
  }

  /** Get notifications paginated */
  @Get('')
  @ApiPaginatedResponse(MessageNotificationDTO)
  getPaginated(
    @UserToken() token: AuthTokenPayload,
    @Query() request: PaginatedRequestDTO,
  ): Observable<PaginatedDTO<MessageNotificationDTO>> {
    return from(this.notificationService.getPaginated(token, request)).pipe(
      map((x) => {
        return {
          docs: x.docs.map(messageNotificationMapper),
          page: x.page,
          limit: x.limit,
          totalDocs: x.totalDocs,
          totalPages: x.totalPages,
        };
      }),
    );
  }

  /** Add a notification to the database */
  @Post('')
  @ApiBody({
    type: MessageNotificationDTO,
    description: 'A complete notification object',
  })
  createNotification(
    @UserToken() token: AuthTokenPayload,
    @Body() notf: MessageNotificationDTO,
  ): Observable<MessageNotificationDTO> {
    return from(this.notificationService.add(token, notf)).pipe(
      map(messageNotificationMapper),
    );
  }
}
