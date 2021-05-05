import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common';

/**
 * Catch payload too large errors
// FIXME: This doesn't catch the error, because body parser errors are currently always error 500. Needs update to nestjs@8.0.0
 */
@Catch(PayloadTooLargeException)
export class PayloadFilter implements ExceptionFilter {
  /**
   * Catches the error
   * @param exception The error thrown
   * @param host The request
   */
  catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    return response.status(413).json({
      statusCode: 413,
      message: `Your request body is too large`,
      error: 'Bad Request',
    });
  }
}
