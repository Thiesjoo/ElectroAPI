import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty } from '@nestjs/swagger';

class Auth {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}

@Controller()
export class LocalController {
  @UseGuards(AuthGuard('local'))
  @ApiBody({ type: Auth })
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
}
