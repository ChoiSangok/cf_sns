import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    /**
     * 요청이 들어올때 req 요청이 들어온 타임스태프
     * [REQ] {요청 path} {요청시간}
     *
     *  요청이 끝날때 다시 타임스태프
     */

    const req = context.switchToHttp().getRequest();

    const path = req.originalUrl;

    const now = new Date();

    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `[RES] ${path} ${new Date().toLocaleString('kr')}  ${new Date().getMilliseconds() - now.getMilliseconds()}ms`,
          ),
        ),
      );
  }
}
