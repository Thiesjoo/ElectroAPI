import { Response } from 'express';
import { Error } from 'mongoose';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

/**
 * Catch all Mongoose validation errors. (Unique validation)
 */
@Catch(Error.ValidationError)
export class ValidationFilter implements ExceptionFilter {
  /**
   * Catches the error
   * @param exception The error thrown
   * @param host The request
   */
  catch(exception: Error.ValidationError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const allErrors = Object.values(exception.errors);
    if (allErrors.length === 0) {
      return response.status(500).json({
        error: 'Something went wrong!',
      });
    }

    return response.status(400).json({
      statusCode: 400,
      message: allErrors.map((x) => x.message),
      error: 'Bad Request',
    });
  }
}
