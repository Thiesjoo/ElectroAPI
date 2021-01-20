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
  @UseGuards(AuthGuard(AuthProviders.Discord), JwtGuard)
  @AuthedUser()
  @ApiBearerAuth()
  @Get('login')
  async login(@Req() req) {
    console.log(req);
    return req.user;
  }

  @Get('callback')
  @UseGuards(AuthGuard(AuthProviders.Discord))
  async redirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    const jwt: string = (req?.user as any)?.jwt;
    console.log('idk?', req.user);
  }
}
