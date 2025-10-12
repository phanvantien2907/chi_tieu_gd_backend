import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { formatDate } from 'src/utilities/format_date';

@Catch(HttpException)
export class CatchEverythingFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if(exception instanceof ThrottlerException){
      return response.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        timestamp: formatDate(new Date()),
        path: request.url,
        msg: 'Thử quá nhiều lần. Vui lòng thử lại sau!'
      })
    }
    const res = exception.getResponse();
    const msg =  typeof res === 'string' ? res  : typeof res === 'object' && res['message']   ? res['message']   : res;
    response.status(status).json(
      { statusCode: status,
        timestamp: formatDate(new Date()),
        path: request.url,
        msg
      });
  }
}