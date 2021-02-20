import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CallHandler,
  Injectable,
  NestInterceptor,
  NotFoundException
} from '@nestjs/common';

@Injectable()
export class EmptyReponseInterceptor implements NestInterceptor {
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
