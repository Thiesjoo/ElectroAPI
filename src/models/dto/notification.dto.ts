import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders } from '../';

/** DTO for authenticating with the notification gateway */
export class NotificationAuthDTO {
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
  fromTime?: number;
  tillTime?: number;
  fromKey?: string;
  tillKey?: string;

  @ApiProperty({
    type: Number,
    required: false,
    default: 50,
    maximum: 100,
    minimum: 1,
  })
  // @IsNumber()
  // @Max(100)
  // @Min(1)
  limit?: number;
  page = 1;

  /** Query string to search for */
  queryString?: string;
}
