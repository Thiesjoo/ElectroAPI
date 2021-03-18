import { Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import { AuthNames, AuthRole } from 'src/models';
import {
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

/** DTO to validate users request */
class UserLoginDTO {
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

/** The response of local api */
class UserLoginResponse {
  /** Access token */
  @ApiProperty()
  access: string;
  /** Refresh token */
  @ApiProperty()
  refresh: string;
}

/** Controller for authenticating with this API */
@Controller('auth/local')
@ApiTags('Auth')
export class LocalController {
  constructor(private configService: ApiConfigService) {}

  /** Setup cookies for users login request */
  @UseGuards(AuthGuard(AuthNames.Local))
  @ApiBody({ type: UserLoginDTO })
  @ApiResponse({
    description:
      'The accesstoken is returned, and all the required cookies are set',
    status: HttpStatus.CREATED,
    type: UserLoginResponse,
  })
  @Post('login')
  login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const tokens = req?.user as {
      access: string;
      refresh: string;
    };

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
    return tokens;
  }
}
