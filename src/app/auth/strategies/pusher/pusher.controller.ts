import { IsString } from 'class-validator';
import Pusher from 'pusher';
import { JwtGuard } from 'src/app';
import { AuthedUser, AuthPrefixes } from 'src/common';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post
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

const prefix = 'private-';

@Controller('auth/pusher')
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('Auth')
export class PusherController {
  constructor(@Inject('Pusher') private pusher: Pusher) {}

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
    if (!body.channel_name.startsWith(prefix)) {
      throw new BadRequestException('Invalid channel name');
    }

    const parsed = body.channel_name.substring(prefix.length);
    console.log(parsed);

    return this.pusher.authenticate(body.socket_id, body.channel_name);
  }
}
