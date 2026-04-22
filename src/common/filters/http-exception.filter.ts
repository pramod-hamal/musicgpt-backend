import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ResponseDto } from 'src/common/type/response';
import { BaseException } from '../exception/base.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {}
  public catch(error: Error, host: ArgumentsHost): void {
    const request: Request = host.switchToHttp().getRequest();
    const response: Response = host.switchToHttp().getResponse<Response>();
    let statusCode = 500;
    // console.log('Error caught by HttpExceptionFilter:', error);

    if (error instanceof BaseException) {
      statusCode = error.getStatus();
      response.status(error.getStatus()).json(error.getResponse());
    } else {
      if (error instanceof HttpException) {
        statusCode = error.getStatus();
      }

      if (error instanceof NotFoundException) {
        error.message = 'Invalid URL';
      }

      if (error instanceof JsonWebTokenError) {
        handleJwtError(error);
        statusCode = 401;
      }

      response.status(statusCode || 500).json({
        statusCode: statusCode,
        timestamp: new Date().toISOString(),
        message: error.message,
        data: {},
      } as ResponseDto);
    }
    const requestStartDate: number = Date.now();
    const requestFinishDate: number = Date.now();
    const message: string =
      `Method: ${request.method}; ` +
      `Status: ${statusCode}; ` +
      `Path: ${request.path}; ` +
      `SpentTime: ${requestFinishDate - requestStartDate}ms`;

    // Logger.error(message, error?.stack, HttpExceptionFilter.name);
  }
}

function handleJwtError(error: Error) {
  if (error instanceof TokenExpiredError) {
    error.message = 'Token Expired';
  } else {
    error.message = 'Invalid Token';
  }
}
