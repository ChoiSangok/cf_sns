import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorater';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationPostDto } from './dto/paginate-post.dto';
import { UsersModel } from 'src/users/entities/users.entity';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/image.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImageService: PostsImagesService,
  ) {}

  // 1) Get / posts
  // 모든 포스트
  @Get()
  getPosts(@Query() query: PaginationPostDto) {
    return this.postsService.paginatePosts(query);
  }

  // 2) Get /posts/:id
  //    id에 해당하는 경우 posts 가져옴
  //    id=1일경우, id가 1인 포스터 가져옴
  @Get(':id')
  getPostId(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) post /posts
  // post 생성
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(@User('id') userId: number, @Body() body: CreatePostDto) {
    /**
     * 트랙잭션과 관련된 모든 쿼리를 담당한 쿼리러너를 실행
     */
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결
    await qr.connect();
    /**
     * 쿼리 러너에서 트랜잭션 실행
     * 이 시점부터 같은 쿼리 러너를 사용하면 트랜잭션안에서 데이터베이스 액션 실행이 가능
     */

    await qr.startTransaction();

    //로직 실행
    try {
      const post = await this.postsService.createPosts(userId, body, qr);

      for (let i = 0; i < body.images.length; i++) {
        await this.postsImageService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }

      await qr.commitTransaction();
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (err) {
      /**
       * 어떤 에러든 에러가 발생하면 트랜잭션 종료후 원래대로
       */
      await qr.rollbackTransaction();
      await qr.release();

      throw new InternalServerErrorException('에러발생');
    }
  }

  // 4) Patch /posts /:id
  // id 해당되는 post 변경
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, body);
  }

  // 5) delete post id
  // id 삭제
  @Delete(':id')
  deleteId(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  // /posts/random
  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }
}
