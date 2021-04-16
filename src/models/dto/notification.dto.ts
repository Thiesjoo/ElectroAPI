import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders, QueryPlaces } from '../';

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
  /** Filter based on the time the notification was sent */
  fromTime?: string;
  /** Filter based on the time the notification was sent */
  tillTime?: string;

  startingAfter?: string;
  endingBefore?: string;

  @ApiProperty({
    required: false,
    maximum: 100,
    minimum: 1,
  })
  limit?: number;
  page?: number;

  queryPlace?: QueryPlaces = QueryPlaces.All;
  /** Query string to search for */
  queryString?: string;
}
