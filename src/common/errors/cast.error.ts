import { Response } from 'express';
import { Error } from 'mongoose';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

/**
 * Catch mongoose casting errors: Wrong object id
 */
@Catch(Error.CastError)
export class CastFilter implements ExceptionFilter {
  /**
   * Catches the error
   * @param exception The error thrown
   * @param host The request
   */
  catch(exception: Error.CastError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    return response.status(400).json({
      statusCode: 400,
      message: `The value at '${exception.path} = ${exception.value}' is not valid`,
      error: 'Bad Request',
    });
  }
}
