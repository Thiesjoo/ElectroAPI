import { IsEnum, IsString } from 'class-validator';
import { FilterQuery } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders, MessageNotification, PaginateOptions } from '../';

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

/** DTO for paginated requests */
export class PaginatedRequestDTO {
  //TODO: add typing for these
  @ApiProperty({ required: false })
  query?: FilterQuery<MessageNotification>;
  @ApiProperty({ required: false })
  options?: PaginateOptions;

  @ApiProperty({
    description: "The page you are looking for (1-indexed). Default: '1'",
    required: false,
    minimum: 1,
    default: 1,
  })
  page: number;
  @ApiProperty({
    description:
      "Maximum number of documents returned. Default: '1'. Max: '100'",
    required: false,
    minimum: 1,
    default: 10,
    maximum: 100,
  })
  limit: number;
}
