import { Response } from 'express';
import { Error } from 'mongoose';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(Error.CastError)
export class CastFilter implements ExceptionFilter {
  catch(exception: Error.ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return response.status(400).json({
      statusCode: 400,
      message: 'ID provided is not valid',
      error: 'Bad Request',
    });
  }
}
