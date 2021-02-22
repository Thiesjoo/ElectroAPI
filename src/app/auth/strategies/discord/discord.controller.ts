import { AuthedUser } from 'src/common';
import { AuthProviders } from 'src/models';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../jwt.guard';

/** The discord controller */
@Controller('auth/discord')
@ApiTags('Auth')
export class DiscordController {
  /** Login route */
  @Get('login')
  @UseGuards(JwtGuard, AuthGuard(AuthProviders.Discord))
  @AuthedUser()
  @ApiBearerAuth()
  async login() {}

  /** Callback from Discord api */
  @Get('callback')
  @UseGuards(JwtGuard, AuthGuard(AuthProviders.Discord))
  @AuthedUser()
  async redirect() {
    return 'Discord profile connected with your profile!';
  }

  @Get('callback2')
  @UseGuards(JwtGuard)
  @AuthedUser()
  async test() {}
}
