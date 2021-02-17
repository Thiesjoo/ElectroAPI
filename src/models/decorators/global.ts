import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Add all required response prefixes to a controller
 */
export const ResponsePrefix = () => {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Something else went wrong',
    }),
  );
};
