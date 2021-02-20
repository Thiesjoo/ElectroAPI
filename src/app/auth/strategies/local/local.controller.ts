import { Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import { AuthProviders } from 'src/models';
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

/** DTO to validate users request */
class ValidationDTO {
  /** Their email */
  @ApiProperty({
    description: 'The email of the user',
    type: String,
  })
  email: string;
  /** Their password */
  @ApiProperty({
    description: 'The password of the user',
    type: String,
  })
  password: string;
}

@Controller('auth/local')
@ApiTags('Auth')
export class LocalController {
  constructor(private configService: ApiConfigService) {}

  /** Setup cookies for users login request */
  @UseGuards(AuthGuard(AuthProviders.Local))
  @ApiBody({ type: ValidationDTO })
  @ApiResponse({
    description:
      'The accesstoken is returned, and all the required cookies are set',
  })
  @Post('login')
  login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const tokens = req?.user as { access: string; refresh: string };

    res.cookie(
      this.configService.cookieNames.access,
      tokens.access,
      this.configService.cookieSettings.access,
    );
    res.cookie(
      this.configService.cookieNames.refresh,
      tokens.refresh,
      this.configService.cookieSettings.refresh,
    );

    return tokens.access;
  }
}
