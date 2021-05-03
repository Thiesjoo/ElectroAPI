import { ResponsePrefix } from 'src/common';
import { ApiConfigService } from 'src/config/configuration';
import {
  AuthTokenPayloadDTO,
  MasterEnums,
  PaginatedDTO,
  Provider,
  RefreshToken,
  RefreshTokenPayloadDTO,
} from 'src/models';
import { allRoutes } from 'src/sockets';
import { Controller, Get, HttpStatus, Redirect } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

/** Simple app controller */
@Controller('/')
@ResponsePrefix()
@ApiExtraModels(
  // General paginated request
  PaginatedDTO,
  //Is not mentioned in a controller, but used in websockets and pushser
  Provider,
  // Socket stuff
  ...allRoutes,

  // A lot of extra enums
  MasterEnums,

  // JWT mapping so client can identify it's own JWT's
  AuthTokenPayloadDTO,
  RefreshToken,
  RefreshTokenPayloadDTO,
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
