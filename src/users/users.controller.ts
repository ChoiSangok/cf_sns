import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 전체 조회
   */
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  /**
   * serialization > 직렬화 > 현재 시스템에서 사용되는 데이터의 구조를 다른 시스템에서도 사용 할수 있는 포맷으로 변경
   * > class 의 object 에서 json 으로 직렬화
   *
   * deserialization > 역직렬화
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }

  // @Post()
  // PostUser(
  //   @Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   return this.usersService.createUser({
  //     nickname,
  //     email,
  //     password,
  //   });
  // }
}
