import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';

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
  @Get(':id')
  getPostId(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  // 3) post /posts
  // post 생성
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPosts(author, title, content);
  }

  // 4) put /posts /id
  // id 해당되는 post 변경
  @Put(':id')
  putPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, author, title, content);
  }

  // 5) delete post id
  // id 삭제
  @Delete(':id')
  deleteId(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
