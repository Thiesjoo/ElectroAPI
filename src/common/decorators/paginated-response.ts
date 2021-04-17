import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

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
        required: ['docs', 'page', 'limit', 'totalDocs', 'totalPages'],
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
          totalDocs: {
            type: 'number',
          },
          totalPages: {
            type: 'number',
          },
        },
      },
    }),
  );
};
