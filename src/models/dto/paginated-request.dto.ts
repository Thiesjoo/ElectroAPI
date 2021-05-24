import { ApiProperty } from '@nestjs/swagger';
import { QueryPlaces } from '../enums/query';

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

  /** true (== 1) is desc, false (== -1) is asc*/
  sort?: boolean = false;

  @ApiProperty({
    required: false,
    enum: QueryPlaces,
    default: QueryPlaces.All,
  })
  queryPlace?: QueryPlaces;
  /** Query string to search for */
  queryString?: string;
}
