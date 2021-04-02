import { AuthedUser } from 'src/common';
import { AuthNames } from 'src/models';
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
  @UseGuards(JwtGuard, AuthGuard(AuthNames.Discord))
  @AuthedUser()
  @ApiBearerAuth()
  async login() {}

  /** Callback from Discord api */
  @Get('callback')
  @UseGuards(JwtGuard, AuthGuard(AuthNames.Discord))
  @AuthedUser()
  async redirect() {
    return 'Discord profile connected with your profile!';
  }
}
