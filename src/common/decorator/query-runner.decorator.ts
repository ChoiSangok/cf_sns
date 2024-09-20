import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostsModel } from 'src/posts/entities/posts.entity';

export const QueryRunner = createParamDecorator(
  (data: keyof PostsModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
      throw new InternalServerErrorException(
        `QueryRunner 사용 하려면 transactionInterceptor를 적용`,
      );
    }

    return req.queryRunner;
  },
);
