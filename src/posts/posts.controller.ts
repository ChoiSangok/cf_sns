import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorater';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
  postPosts(@User('id') userId: number, @Body() body: CreatePostDto) {
    return this.postsService.createPosts(userId, body);
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
