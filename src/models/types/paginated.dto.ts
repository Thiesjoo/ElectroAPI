import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

/**
 * DTO for paginated response
 */
export class PaginatedDto<T> {
  docs: T[];
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
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
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
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
        ],
      },
    }),
  );
};
