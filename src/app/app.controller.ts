import { ResponsePrefix } from 'src/common';
import {
  IngestClient,
  MasterEnums,
  NotificationAuthDTO,
  PaginatedDto,
  Provider
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
  NotificationAuthDTO,
)
export class AppController {
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
    type: String,
    description: 'Hello world!',
  })
  getHello(): string {
    return 'Hello world!';
  }
}
