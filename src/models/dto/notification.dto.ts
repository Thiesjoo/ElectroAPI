import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders } from '../';

/** DTO for authenticating with the notification gateway */
export class NotificationAuthDto {
  /** Provider to authenticate with */
  @ApiProperty()
  @IsEnum(AuthProviders)
  provider: AuthProviders;
  /** Uid of user */
  @IsString()
  @ApiProperty()
  id: string;
}
