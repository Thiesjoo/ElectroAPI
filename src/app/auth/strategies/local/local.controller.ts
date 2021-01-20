import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { ValidationDTO } from './local.validator';

@Controller()
export class LocalController {
  @UseGuards(AuthGuard('local'))
  @ApiBody({ type: ValidationDTO })
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
}
