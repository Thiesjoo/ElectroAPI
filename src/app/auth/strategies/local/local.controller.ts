import { IsAlphanumeric, IsEmail, IsString, Length } from 'class-validator';
import { Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import { AuthNames, Tokens } from 'src/models';
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

/** DTO to validate users request */
class UserLoginDTO {
  /** Their email */
  @ApiProperty({
    description: 'The email of the user',
    type: String,
  })
  @IsEmail()
  email: string;
  /** Their password */
  @ApiProperty({
    description: 'The password of the user',
    type: String,
  })
  @IsString()
  password: string;
}

/** The response of local api */
class UserLoginResponse implements Tokens {
  /** Access token */
  @ApiProperty()
  access: string;
  /** Refresh token */
  @ApiProperty()
  refresh: string;
}

class RegisterDTO extends UserLoginDTO {
  /** Name of user */
  @ApiProperty({
    description: 'The name of the user',
  })
  @IsString()
  @IsAlphanumeric()
  @Length(3)
  name: string;
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
  @UseGuards(AuthGuard(AuthNames.Local))
  @ApiBody({ type: UserLoginDTO })
  @ApiResponse({
    description:
      'The accesstoken is returned, and all the required cookies are set',
    status: HttpStatus.CREATED,
    type: UserLoginResponse,
  })
  @Post('login')
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
  @ApiBody({ type: RegisterDTO })
  @ApiResponse({
    description:
      'The accesstoken is returned, and all the required cookies are set',
    status: HttpStatus.CREATED,
    type: UserLoginResponse,
  })
  @Post('register')
  async register(
    @Body() registerDTO: RegisterDTO,
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
