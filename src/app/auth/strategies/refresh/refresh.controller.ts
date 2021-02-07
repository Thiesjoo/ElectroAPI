import { Request, Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import { AuthedUser, AuthProviders } from 'src/models';
import {
  Controller,
  Get,
  Injectable,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../jwt.guard';
import { RefreshService } from './refresh.service';

@Controller('auth/refresh')
@ApiTags('Auth')
export class RefreshController {
  constructor(
    private readonly refreshService: RefreshService,
    private readonly configService: ApiConfigService,
  ) {}

  @Get(['wipecookies', 'logout'])
  @UseGuards(JwtGuard)
  @AuthedUser()
  async wipeCookies(@Req() req: Request, @Res() res: Response) {
    const {
      expires: a,
      ...restAccess
    } = this.configService.cookieSettings.access;
    res.clearCookie(this.configService.cookieNames.access, restAccess);

    const token = req.cookies[this.configService.cookieNames.refresh];
    console.log(token);
    const {
      expires,
      ...restRefresh
    } = this.configService.cookieSettings.refresh;
    res.clearCookie(this.configService.cookieNames.refresh, restRefresh);
    //FIXME: Revoke refresh token

    await this.refreshService.revokeToken(token);

    res.json({ ok: true });
  }

  @Get('access')
  @AuthedUser()
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('req');
    const newToken = await this.refreshService.getAccessToken(
      req.cookies[this.configService.cookieNames.refresh],
    );
    res.cookie(
      this.configService.cookieNames.access,
      newToken,
      this.configService.cookieSettings.access,
    );

    return newToken;
  }
}
