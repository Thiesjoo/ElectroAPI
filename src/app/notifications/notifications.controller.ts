import { UserToken } from 'src/common/decorators/user';
import { ApiConfigService } from 'src/config/configuration';
import {
  ApiPaginatedResponse,
  AuthedUser,
  AuthPrefixes,
  AuthTokenPayload,
  IMessageNotification,
  PaginatedDto,
  ResponsePrefix
} from 'src/models';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth';
import { NotificationService } from './notifications.service';

/** Service to handle REST for notifications */
@Controller('api/notifications')
@ResponsePrefix()
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('Notification')
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
    const res = await this.notificationService.getWithID(token, id);
    return res.length > 0 ? res[0] : null;
  }

  /** Get notifications paginated */
  @Get('')
  @ApiQuery({
    name: 'query',
    type: String,
    description: "The string you are searching for. Default: ' '",
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: "The page you are looking for. Default: '1'",
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description:
      "Maximum number of documents returned. Default: '1'. Max: '100'",
    required: false,
  })
  @ApiPaginatedResponse(IMessageNotification)
  async getPaginated(
    @UserToken() token: AuthTokenPayload,
    @Query('query') query: string = '',
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
  ): Promise<PaginatedDto<IMessageNotification>> {
    const res = await this.notificationService.getPaginated(
      token,
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
