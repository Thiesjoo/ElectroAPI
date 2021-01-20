import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthProviders } from 'src/models';

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

@Controller('auth/local')
@ApiTags('Auth')
export class LocalController {
  @UseGuards(AuthGuard(AuthProviders.Local))
  @ApiBody({ type: ValidationDTO })
  @Post('login')
  async login(@Request() req) {
    return (req?.user as { token: string }).token;
  }
}
