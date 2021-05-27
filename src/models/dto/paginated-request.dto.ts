import { IsAlphanumeric, IsOptional, MaxLength } from 'class-validator';
import { ToBoolean } from 'src/common/decorators/transformers';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

/** All the filter options for the paginated request. Used in DTO and in seperate filter request */
export class PaginatedFilter {
  /** Filter based on the time the notification was sent */
  fromTime?: string;
  /** Filter based on the time the notification was sent */
  tillTime?: string;

  /** true (== -1 in mongo) is desc, false (== 1 in mongo) is asc. Default is true */
  @ToBoolean()
  sort?: boolean = true;

  /** For all query's: Either specify queryAll or 1 of [author, message, title] */
  @QueryDecorator()
  queryAuthor?: string;
  @QueryDecorator()
  queryMessage?: string;
  @QueryDecorator()
  queryTitle?: string;
  @QueryDecorator()
  queryAll?: string;
}

/** DTO for paginated requests */
export class PaginatedRequestDTO extends PaginatedFilter {
  startingAfter?: string;
  endingBefore?: string;

  @ApiProperty({
    required: false,
    maximum: 100,
    minimum: 1,
  })
  limit?: number;
  page?: number;
}

function QueryDecorator() {
  return applyDecorators(IsAlphanumeric(), IsOptional(), MaxLength(20));
}
