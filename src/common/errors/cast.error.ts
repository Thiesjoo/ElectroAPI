import { Response } from 'express';
import { Error } from 'mongoose';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';

/**
 * Catch mongoose casting errors: Wrong object id
 */
@Catch(Error.CastError)
export class CastFilter implements ExceptionFilter {
  private readonly logger = new Logger(CastFilter.name);

  catch(exception: Error.CastError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    this.logger.error(exception);

    return response.status(400).json({
      statusCode: 400,
      message: `The value at '${exception.path} = ${exception.value}' is not valid`,
      error: 'Bad Request',
    });
  }
}
