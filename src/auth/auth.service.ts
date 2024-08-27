import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
@Injectable()
export class AuthService {
  /** * 기능 * 1. registerWithEmail *  - email, nickname, password, 입력 후 사용자 생성 *  - 생성완료후 accessToken / refreshToken 반환 *  - 가입 후 로그인 <- 방지를 위한 > 바로 로그인 설계 * * 2. loginWithEmail *  - email, password 입력하면 사용자 검증 진행 *  - 검증이 완료되면 accessToken / refreshToken 반환 * * 3. loginUser *  - 1, 2에서 필요한 accessToken / refreshToken 반환 * * 4. signToken *  - 3에서 필요한 accessToken 과 refreshToken 을 sign * * 5. authenticateWithEmailAndPassword *  - 2에서 로그인을 진행할때 필요한 기본적인 검증 *  1. 사용자 존재 확인 *  2. 비밀번호 맞는지 확인 *  3. 모두 통과 시 사용자 정보 반환 *  4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성 * */
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * 토큰을 사용하게 되는 방식
   * 1. 사용자가 로그인 또는 회원가입을 진행하면
   *  accessToken 과 refreshToken을 발급받는다
   *
   * 2. 로그인 할때는 Basic 토큰과 함께 요청을 보낸다
   *  Basic 토큰은 이메일:비밀번호 를 base64로 인코딩 형태
   *  {authrization: 'Basic {token}' }
   *
   * 3. 아무나 접근 할 수 없는 정보 (private route)를 접근 할 때는
   *  accessToken을 Header에 추가해서 요청과 함께 전송
   *  {authrization: 'Bearer {token}' }
   *
   * 4. 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보냄
   *  사용자가 누구인지 알 수 있다.
   *  현재 로그인한 사용자가 작성한 포스트만 가져오려면
   *  토큰이ㅡ sub 값에 입력되있는 사용자의 포스트만 따로 필터링 할 수 있다
   *  특정 사용자의 토큰이 없다면, 다른 사용자의 데이터를 접근 못함
   *
   * 5. 모든 토큰은 만료 기간이 있고 만료기간이 지나면 새로운 토큰 발급
   *  그렇지 않으면 jwtService.verify()에서 인증 통과가 안됌
   *  그러니 access 토큰을 새로 발급 받을 수 있는 auth/token/access 와
   *  refresh 토큰을 새로 발급 받을 수 있는 /auth/token/refresh 가 필요함
   *
   * 6. 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청 해서
   *  새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route 에 접근한다
   */

  /**
   * Header로 부터 토큰을 받을 떄
   *
   * {authrization: 'Basic {token}'}
   * {authrization: 'Bearer {token}'}
   */

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';
    // 검증
    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰');
    }
    const token = splitToken[1];

    return token;
  }

  /**
   * Basic sdf;afjkhadfjhalkdjf
   *
   * 1. sdf;afjkhadfjhalkdjf > email:password
   * 2. email:passowrd > [email, password]
   *  {email: email, password: password}
   */
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  /**
   * 토큰검증
   * @param token 토큰
   * @returns
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('토큰만료 ');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    /**
     * sub: id
     * email: email
     * type: 'access' | 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('토큰 재발급은 Refresh 로만 가능');
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }

  /** * Payload에 들어갈 정보 * 1) email * 2) sub > id * 3) type: 'access' | 'refresh' * */ signToken(
    user: Pick<UsersModel, 'email' | 'id'>,
    isRefreshToken: boolean,
  ) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };
    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    /** *  1. 사용자 존재 확인 *  2. 비밀번호 맞는지 확인 *  3. 모두 통과 시 사용자 정보 반환 */ const existingUser =
      await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자');
    }
    /** * 파라미터 * 1. 입력된 비밀번호 * 2. 기존 해쉬 > 사용자 정보에 있는 Hash */ const passOk =
      await bcrypt.compare(user.password, existingUser.password);
    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }
    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: RegisterUserDto) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
