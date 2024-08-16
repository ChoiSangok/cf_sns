import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule, // AuthModule 추가
    UsersModule, // UsersModule 추가
  ],
  controllers: [PostsController],
  providers: [PostsService, AccessTokenGuard],
  exports: [PostsService],
})
export class PostsModule {}
