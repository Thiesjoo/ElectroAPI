import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Error } from 'mongoose';
import { Response } from 'express';

@Catch(Error.ValidationError)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: Error.ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

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
