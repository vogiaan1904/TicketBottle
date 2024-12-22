import { NO_APPLY_RES_INTERCEPTOR } from '@/decorators/apiResponseMessage.decorator';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const isNoInterceptor = this.reflector.get<boolean>(
      NO_APPLY_RES_INTERCEPTOR,
      context.getHandler(),
    );

    if (isNoInterceptor) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message:
            this.reflector.get<string>(
              'response_message',
              context.getHandler(),
            ) || 'Ok',
          data,
        };
      }),
    );
  }
}
