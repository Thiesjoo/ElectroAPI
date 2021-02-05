import { Request } from 'express';
import { AuthedUser, AuthProviders } from 'src/models';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../jwt.guard';

@Controller('auth/discord')
@ApiTags('Auth')
export class DiscordController {
  @UseGuards(JwtGuard, AuthGuard(AuthProviders.Discord))
  @AuthedUser()
  @ApiBearerAuth()
  @Get('login')
  async login() {}

  @Get('callback')
  @UseGuards(JwtGuard, AuthGuard(AuthProviders.Discord))
  @AuthedUser()
  async redirect(@Req() req: Request) {
    return (req?.user as any)?.jwt;
  }
}
