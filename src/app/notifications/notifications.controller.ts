import { Request, Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import {
  AuthedUser,
  AuthPrefixes,
  AuthTokenPayload,
  DeveloperOnly,
  ResponsePrefix
} from 'src/models';
import { UserToken } from 'src/models/decorators/user';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Redirect,
  Req,
  Res
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
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
    type: String,
    description: 'Hello world!',
  })
  getAll(@UserToken() token: AuthTokenPayload) {
    return this.notificationService.getAll(token);
  }
}
