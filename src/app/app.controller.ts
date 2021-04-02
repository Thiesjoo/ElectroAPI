import { ResponsePrefix } from 'src/common';
import { ApiConfigService } from 'src/config/configuration';
import {
  AuthTokenPayload,
  IngestClient,
  MasterEnums,
  NotificationAuthDto,
  PaginatedDto,
  Provider,
  RefreshToken,
  RefreshTokenPayload,
} from 'src/models';
import { Controller, Get, HttpStatus, Redirect } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

/** Simple app controller */
@Controller('/')
@ResponsePrefix()
@ApiExtraModels(
  PaginatedDto,
  Provider,
  MasterEnums,
  IngestClient,
  NotificationAuthDto,
  AuthTokenPayload,
  RefreshToken,
  RefreshTokenPayload,
)
export class AppController {
  constructor(private configService: ApiConfigService) {}

  /** Redirect main page to API */
  @Get('')
  @Redirect('api', 301)
  redirect() {
    return 'Redirecting to /api';
  }

  /** Simple hello world route */
  @Get('hello')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hello world!',
  })
  getHello() {
    return { ok: true, msg: 'Hello world!' };
  }

  /** Simple version route */
  @Get('version')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns version of the api',
  })
  getVersion() {
    return { ok: true, version: this.configService.version };
  }
}
