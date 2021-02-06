import { AuthProviders } from 'src/models';
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiConfigService } from 'src/config/configuration';
import { Response } from 'express';
import { Get } from '@nestjs/common';

@Controller('auth')
@ApiTags('Auth')
export class RefreshController {
  constructor(private configService: ApiConfigService) {}
  @Get(['wipecookies', 'logout'])
  wipeCookies(@Res() res: Response) {
    console.log(this.configService);
    const {
      expires: a,
      ...restAccess
    } = this.configService.cookieSettings.access;
    res.clearCookie(this.configService.cookieNames.access, restAccess);

    const {
      expires,
      ...restRefresh
    } = this.configService.cookieSettings.refresh;
    res.clearCookie(this.configService.cookieNames.refresh, restRefresh);
    //FIXME: Revoke access token

    res.json({ ok: true });
  }
}
