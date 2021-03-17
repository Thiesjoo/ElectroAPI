import { IsString } from 'class-validator';
import Pusher from 'pusher';
import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

class PusherAuthBody {
  @IsString()
  socket_id: string;
  @IsString()
  channel_name: string;
}

@Controller('pusher')
export class PusherController {
  constructor(@Inject('Pusher') private pusher: Pusher) {}

  @Post('/auth')
  @ApiBody({ type: PusherAuthBody })
  async pusherAuth(@Body() body: PusherAuthBody) {
    return this.pusher.authenticate(body.socket_id, body.channel_name);
  }
}
