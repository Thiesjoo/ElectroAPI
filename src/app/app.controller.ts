import { ResponsePrefix } from 'src/common';
import { Controller, Get, HttpStatus, Redirect } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/** Simple app controller */
@Controller('/')
@ResponsePrefix()
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
