import { ResponsePrefix } from 'src/common';
import { PaginatedDto } from 'src/models';
import { Controller, Get, HttpStatus, Redirect } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

/** Simple app controller */
@Controller('/')
@ResponsePrefix()
@ApiExtraModels(PaginatedDto)
export class AppController {
  /** Redirect main page to API */
  @Get('')
  @Redirect('api', 301)
  redirect() {}

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
