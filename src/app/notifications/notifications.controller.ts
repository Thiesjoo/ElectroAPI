import { ApiConfigService } from 'src/config/configuration';
import {
  AuthedUser,
  AuthPrefixes,
  AuthTokenPayload,
  DeveloperOnly,
  IMessageNotification,
  ResponsePrefix
} from 'src/models';
import { UserToken } from 'src/models/decorators/user';
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth';
import { NotificationService } from './notifications.service';

@Controller('api/notifications')
@ResponsePrefix()
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('Notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly configService: ApiConfigService,
  ) {}

  @Get(':id/')
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    description: 'Hello world!',
  })
  getWithId(@Param('id') id: string, @UserToken() token: AuthTokenPayload) {
    return this.notificationService.getWithID(token, id);
  }

  @Get('')
  @DeveloperOnly()
  @ApiResponse({
    status: HttpStatus.OK,
    type: [IMessageNotification],
    description: 'A list of notifications',
  })
  getAll(@UserToken() token: AuthTokenPayload) {
    return this.notificationService.getAll(token);
  }

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
