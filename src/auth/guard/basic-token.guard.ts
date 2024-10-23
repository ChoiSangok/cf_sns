/**
 * 구현할 기능
 *
 * 1. 요청객체 ( request)를 불러오고
 *     authorization header로 토큰을 가져온다
 *
 * 2. authService.extractTokenFromHeader를 이용해서
 *     사용할 수 있는 형태로 토큰을 추출
 *
 * 3. authService.decodeBasicToken 실행해서
 *      email과 password 추출
 *
 * 4. email과 password 이용해서 사용자 가져옴
 *      authService.authenticateWithEmailAndPassword
 *
 * 5. 찾아낸 사용자를 (1) 요청 객체에 붙여준다
 *      req.user = uesr;
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException();
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    req.user = user;

    return true;
  }
}

