import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthedUser, AuthProviders } from 'src/models';
import { JwtGuard } from '../../jwt.guard';
import { Request } from 'express';

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
