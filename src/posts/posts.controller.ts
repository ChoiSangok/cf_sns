import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorater';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationPostDto } from './dto/paginate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/image.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';

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
  @UseFilters(HttpExceptionFilter)
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
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
  ) {
    //로직 실행
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
    return this.postsService.getPostById(post.id, qr);
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
}
