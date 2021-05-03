import { IsString } from 'class-validator';
import Pusher from 'pusher';
import { JwtGuard } from 'src/app';
import { AuthedUser, AuthPrefixes, UserToken } from 'src/common';
import { InjectionTokens } from 'src/common/injection.tokens';
import { AuthTokenPayloadDTO, pusherPrivatePrefix } from 'src/models';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

class PusherAuthBody {
  @ApiProperty()
  @IsString()
  socket_id: string;
  @ApiProperty()
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
  async pusherAuth(
    @Body() body: PusherAuthBody,
    @UserToken() token: AuthTokenPayloadDTO,
  ): Promise<PusherResponse> {
    if (!body.channel_name.startsWith(pusherPrivatePrefix)) {
      throw new BadRequestException('Invalid channel name');
    }

    const parsed = body.channel_name.substring(pusherPrivatePrefix.length);

    if (parsed !== token.sub) {
      console.warn('Unauthorized Pusher access:', token);
      throw new UnauthorizedException();
    }

    //TODO: Check if user authorized this browser/client

    return this.pusher.authenticate(body.socket_id, body.channel_name);
  }
}
