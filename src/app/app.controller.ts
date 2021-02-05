import { Controller, Get, HttpStatus, Redirect, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller('')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description:
    'Whenever the bearer token is missing, the request will be denied',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'The roles of the user did not match any of the allowed roles',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Something else went wrong',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  @Redirect('/api', 301)
  redirect() {}

  @Get('hello')
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    description: 'Hello world!',
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get(['wipecookies', 'logout'])
  wipeCookies(@Res({ passthrough: true }) res: Response): string {
    res.cookie('jwt', '');
    return 'OK!';
  }
}
