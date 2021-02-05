import { Req, Res } from '@nestjs/common';
import { Controller, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthedUser, AuthProviders } from 'src/models';
import { JwtGuard } from '../../jwt.guard';
import { Request, Response } from 'express';

@Controller('auth/discord')
@ApiTags('Auth')
export class DiscordController {
  @UseGuards(JwtGuard, AuthGuard(AuthProviders.Discord))
  @AuthedUser()
  @ApiBearerAuth()
  @Get('login')
  async login(@Req() req) {}

  @Get('callback')
  @UseGuards(JwtGuard, AuthGuard(AuthProviders.Discord))
  @AuthedUser()
  async redirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return (req?.user as any)?.jwt;
  }
}
