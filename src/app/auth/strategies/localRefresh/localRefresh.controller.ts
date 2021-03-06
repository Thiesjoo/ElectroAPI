import { Request, Response } from 'express';
import { AuthedUser, extractToken } from 'src/common';
import { ApiConfigService } from 'src/config/configuration';
import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @Get('logout')
  @UseGuards(JwtGuard)
  @AuthedUser()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Expiry time is not allowed in clearCookie
    const {
      expires: _, // eslint-disable-line
      ...restAccess
    } = this.configService.cookieSettings.access;
    res.clearCookie(this.configService.cookieNames.access, restAccess);

    const token = req.cookies[this.configService.cookieNames.refresh];
    const {
      expires, // eslint-disable-line
      ...restRefresh
    } = this.configService.cookieSettings.refresh;
    res.clearCookie(this.configService.cookieNames.refresh, restRefresh);
    await this.localRefreshService.revokeToken(token);

    return { ok: true };
  }

  /** Refresh the users token */
  @Get('access')
  @AuthedUser()
  @ApiResponse({
    description: 'Your new token',
    status: HttpStatus.OK,
    type: String,
  })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const newToken = await this.localRefreshService.getAccessToken(
      extractToken(req, this.configService, 'refresh'),
    );
    res.cookie(
      this.configService.cookieNames.access,
      newToken,
      this.configService.cookieSettings.access,
    );

    return { ok: true, token: newToken };
  }
}
