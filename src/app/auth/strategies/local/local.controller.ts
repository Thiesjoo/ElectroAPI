import { Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import { AuthNames, Tokens } from 'src/models';
import { UserLoginDTO, UserRegisterDTO } from 'src/models/dto/user.login.dto';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthService } from './local.service';

/** The response of local api */
class UserLoginResponse implements Tokens {
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
  constructor(
    private configService: ApiConfigService,
    private localService: LocalAuthService,
  ) {}

  private setCookies(tokens: Tokens, res: Response) {
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
  }

  /** Setup cookies for users login request */
  @Post('login')
  @UseGuards(AuthGuard(AuthNames.Local))
  @ApiBody({ type: UserLoginDTO })
  @ApiResponse({
    description:
      'The accesstoken is returned, and all the required cookies are set',
    status: HttpStatus.CREATED,
    type: UserLoginResponse,
  })
  login(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    /** For validation purposes */
    //eslint-disable-next-line
    @Body() loginData: UserLoginDTO,
  ): Tokens {
    const tokens = req?.user as Tokens;
    this.setCookies(tokens, res);

    return tokens;
  }

  /** Register new user */
  @Post('register')
  @ApiBody({ type: UserRegisterDTO })
  @ApiResponse({
    description:
      'The accesstoken is returned, and all the required cookies are set',
    status: HttpStatus.CREATED,
    type: UserLoginResponse,
  })
  async register(
    @Body() registerDTO: UserRegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.localService.register(
      registerDTO.name,
      registerDTO.email,
      registerDTO.password,
    );
    this.setCookies(tokens, res);
    return tokens;
  }
}
