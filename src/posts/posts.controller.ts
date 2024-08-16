import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) Get / posts
  // 모든 포스트
  @Get()
  getPosts() {
    return this.postsService.getAllPost();
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
  postPosts(
    @Request() req: any,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const authorId = req.user.id;

    return this.postsService.createPosts(authorId, title, content);
  }

  // 4) put /posts /:id
  // id 해당되는 post 변경
  @Put(':id')
  putPost(
    @Param('id', ParseIntPipe) id: number,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, title, content);
  }

  // 5) delete post id
  // id 삭제
  @Delete(':id')
  deleteId(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
