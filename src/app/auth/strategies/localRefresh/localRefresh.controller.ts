import { Request, Response } from 'express';
import { ApiConfigService } from 'src/config/configuration';
import { AuthedUser } from 'src/models';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../jwt.guard';
import { LocalRefreshService } from './localRefresh.service';

/** Local refresh token controller */
@Controller('auth/refresh')
@ApiTags('Auth')
export class LocalRefreshController {
  constructor(
    private localRefreshService: LocalRefreshService,
    private configService: ApiConfigService,
  ) {}

  /** Wipe cookies of user, and revoke them in the database */
  @Get(['wipecookies', 'logout'])
  @UseGuards(JwtGuard)
  @AuthedUser()
  async wipeCookies(@Req() req: Request, @Res() res: Response) {
    // Expiry time is not allowed in clearCookie
    const {
      expires: a,
      ...restAccess
    } = this.configService.cookieSettings.access;
    res.clearCookie(this.configService.cookieNames.access, restAccess);

    const token = req.cookies[this.configService.cookieNames.refresh];
    const {
      expires,
      ...restRefresh
    } = this.configService.cookieSettings.refresh;
    res.clearCookie(this.configService.cookieNames.refresh, restRefresh);
    await this.localRefreshService.revokeToken(token);

    res.json({ ok: true });
  }

  /** Refresh the users token */
  @Get('access')
  @AuthedUser()
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const newToken = await this.localRefreshService.getAccessToken(
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
