import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty } from '@nestjs/swagger';

class ValidationDTO {
  @ApiProperty({
    description: 'The email of the user',
    type: String,
  })
  email: string;
  @ApiProperty({
    description: 'The password of the user',
    type: String,
  })
  password: string;
}

@Controller()
export class LocalController {
  @UseGuards(AuthGuard('local'))
  @ApiBody({ type: ValidationDTO })
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
}
