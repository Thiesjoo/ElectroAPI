import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

/**
 * DTO for paginated response
 */
export class PaginatedDto<T> {
  /** The docs that are provided */
  docs: T[];
  /** Current page */
  @ApiProperty()
  page: number;
  /** Amount of docs per page */
  @ApiProperty()
  limit: number;
  /** Total number of docs */
  @ApiProperty()
  total: number;
}

/**
 * Add schema to swagger and add the ApiOk response
 * @param model Model of the DTO
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `Paginated${model.name}`,
        type: 'object',
        required: ['docs', 'page', 'limit', 'total'],
        properties: {
          docs: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          page: {
            type: 'number',
          },
          limit: {
            type: 'number',
          },
          total: {
            type: 'number',
          },
        },
      },
    }),
  );
};
