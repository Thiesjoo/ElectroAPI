import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CallHandler,
  Injectable,
  NestInterceptor,
  NotFoundException
} from '@nestjs/common';

/** Empty response handler */
@Injectable()
export class EmptyResponseInterceptor implements NestInterceptor {
  /** Throw http 404 error on empty array or on value undefined */
  intercept(_, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((val) => {
        if (!val || val?.length === 0) {
          throw new NotFoundException();
        }
        return val;
      }),
    );
  }
}
