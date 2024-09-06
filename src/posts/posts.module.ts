import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH } from 'src/common/const/path.const';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule, // AuthModule 추가
    UsersModule, // UsersModule 추가
    CommonModule,
    MulterModule.register({
      limits: {
        //byte 단위
        fileSize: 10000000,
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb (에러, boolean)
         * 첫번째 파라미터에는 에러가 있을 경우, 에러 정보를 넣어줌
         * 두번째 파라미터는 파일을 받을지 말지 boolean 을 넣어줌
         */

        //xxx.jpa => 확장자만 따옴
        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(new BadRequestException('jpg/jpeg/png 만가능 '), false);
        }

        return cb(null, true);
      },

      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, POST_IMAGE_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, AccessTokenGuard],
  exports: [PostsService],
})
export class PostsModule {}
