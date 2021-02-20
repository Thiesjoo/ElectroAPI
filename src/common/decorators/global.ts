import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Add all required response prefixes to a controller
 */
export const ResponsePrefix = () => {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Your API parameters are invalid',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'The requested resource is not available',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Something went wrong serverside',
    }),
  );
};
