import { AuthedUser, AuthPrefixes, ResponsePrefix } from 'src/common';
import { UserToken } from 'src/common/decorators/user';
import { ApiConfigService } from 'src/config/configuration';
import {
  ApiPaginatedResponse,
  AuthTokenPayload,
  IMessageNotification,
  PaginatedRequestDTO,
  PaginateResult,
} from 'src/models';
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
  @ApiPaginatedResponse(IMessageNotification)
  async getPaginated(
    @UserToken() token: AuthTokenPayload,
    @Query() request: PaginatedRequestDTO,
  ): Promise<PaginateResult<IMessageNotification>> {
    const res = await this.notificationService.getPaginated(token, request);
    //MAP result
    return res;

    // return {
    //   docs: res.docs,
    //   page: res.page,
    //   limit: res.limit,
    //   total: res.totalDocs,
    // };
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
