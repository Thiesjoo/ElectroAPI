import { ResponsePrefix } from 'src/models';
import { Controller, Get, HttpStatus, Redirect } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller('')
@ResponsePrefix()
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
}
