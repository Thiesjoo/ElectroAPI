import { Response } from 'express';
import { Error } from 'mongoose';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

/**
 * Catch all Mongoose validation errors. (Unique validation, and WS errors)
 */
@Catch(Error.ValidationError)
export class ValidationFilter
  extends BaseWsExceptionFilter
  implements ExceptionFilter {
  /**
   * Catches the error
   * @param exception The error thrown
   * @param host The request
   */
  catch(exception: Error.ValidationError, host: ArgumentsHost) {
    const allErrors = Object.values(exception.errors);
    if (host.getType() === 'ws') {
      console.log('Went through ValidationError filter');
      if (allErrors.length === 0) {
        return super.catch(
          new WsException({
            error: 'Something went wrong!',
          }),
          host,
        );
      }

      return super.catch(
        new WsException({
          statusCode: 400,
          message: allErrors.map((x) => x.message),
          error: 'Bad Request',
        }),
        host,
      );
    } else {
      const response = host.switchToHttp().getResponse<Response>();

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
}
