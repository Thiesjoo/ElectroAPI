import { AuthedUser, AuthPrefixes, ResponsePrefix } from 'src/common';
import { UserToken } from 'src/common/decorators/user';
import { ApiConfigService } from 'src/config/configuration';
import {
  ApiPaginatedResponse,
  AuthTokenPayload,
  IMessageNotification,
  PaginatedDto,
  PaginatedRequestDTO,
} from 'src/models';
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth';
import { NotificationService } from './notifications.service';

/** Service to handle REST for notifications */
@Controller('api/notifications')
@ResponsePrefix()
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('Notification')
@ApiExtraModels(IMessageNotification)
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private configService: ApiConfigService,
  ) {}

  /** Get notification with ID */
  @Get(':id/')
  @ApiResponse({
    status: HttpStatus.OK,
    type: IMessageNotification,
    description: 'The requested notification',
  })
  async getWithId(
    @Param('id') id: string,
    @UserToken() token: AuthTokenPayload,
  ) {
    return this.notificationService.getWithID(token, id);
  }

  /** Get notifications paginated */
  @Get('')
  @ApiBody({
    description: 'The string you are searching for',
    required: false,
    type: PaginatedRequestDTO,
  })
  @ApiPaginatedResponse(IMessageNotification)
  async getPaginated(
    @UserToken() token: AuthTokenPayload,
    @Body('query') { query, options, limit, page }: PaginatedRequestDTO,
  ): Promise<PaginatedDto<IMessageNotification>> {
    const res = await this.notificationService.getPaginated(
      token,
      options,
      query,
      page,
      limit,
    );

    return {
      docs: res.docs,
      page: res.page,
      limit: res.limit,
      total: res.totalDocs,
    };
  }

  /** Add a notification to the database */
  @Post('')
  @ApiBody({
    type: IMessageNotification,
    description: 'A complete notification object',
  })
  createNotification(
    @UserToken() token: AuthTokenPayload,
    @Body() notf: IMessageNotification,
  ) {
    return this.notificationService.add(token, notf);
  }
}
