import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for paginated response
 */
export class PaginatedDTO<T> {
  @ApiProperty()
  docs: T[];
  /** Current page */
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
}
