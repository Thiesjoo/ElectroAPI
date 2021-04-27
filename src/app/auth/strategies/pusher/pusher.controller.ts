import { IsString } from 'class-validator';
import Pusher from 'pusher';
import { JwtGuard } from 'src/app';
import { AuthedUser, AuthPrefixes } from 'src/common';
import { InjectionTokens } from 'src/common/injection.tokens';
import { pusherPrivatePrefix } from 'src/models';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

class PusherAuthBody {
  @IsString()
  socket_id: string;
  @IsString()
  channel_name: string;
}

class PusherResponse {
  @ApiProperty()
  auth: string;
  @ApiProperty()
  channel_data?: string;
  @ApiProperty()
  shared_secret?: string;
}

@Controller('auth/pusher')
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('Auth')
export class PusherController {
  constructor(@Inject(InjectionTokens.Pusher) private pusher: Pusher) {}

  @Post('/login')
  @ApiBody({ type: PusherAuthBody })
  @HttpCode(200)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The auth code for pusher',
    type: PusherResponse,
  })
  async pusherAuth(@Body() body: PusherAuthBody): Promise<PusherResponse> {
    console.log(body);
    if (!body.channel_name.startsWith(pusherPrivatePrefix)) {
      throw new BadRequestException('Invalid channel name');
    }

    const parsed = body.channel_name.substring(pusherPrivatePrefix.length);
    console.log('Parsed from pusher', parsed);

    return this.pusher.authenticate(body.socket_id, body.channel_name);
  }
}
