import { Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import { AuthedUser, AuthPrefixes, ResponsePrefix } from 'src/models';
import { Controller, Get, HttpStatus, Redirect, Res } from '@nestjs/common';
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

  @Get('hello')
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    description: 'Hello world!',
  })
  getHello() {
    return this.notificationService.getAll();
  }
}
