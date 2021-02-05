import { AuthProviders } from 'src/models';
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';

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
  login(@Req() req, @Res({ passthrough: true }) res) {
    const token = (req?.user as { token: string }).token;
    res.cookie('jwt', token);
    return token;
  }
}
