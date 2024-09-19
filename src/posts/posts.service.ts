import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThan,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationPostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HOST_KEY,
  ENV_PROTOCOL_KEY,
} from 'src/common/const/env-keys.const';
import { ImageModel } from 'src/common/entity/image.entity';
import { DEFALUT_POST_FIND_OPTIONS } from './const/default-post-find-options';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  /**
   *
   * @returns 전체조회
   */
  async getAllPosts() {
    return this.postsRepository.find({
      ...DEFALUT_POST_FIND_OPTIONS,
    });
  }

  /**
   * 테스트용
   */
  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPosts(userId, {
        title: `임의 생성 ${i}`,
        content: `임의 생성 ${i}`,
        images: [],
      });
    }
  }

  /**
   * pagination
   * 1. 오름차순으로 정렬하는 pagination
   */

  async paginatePosts(pageDto: PaginationPostDto) {
    return this.commonService.paginate(
      pageDto,
      this.postsRepository,
      {
        ...DEFALUT_POST_FIND_OPTIONS,
      },
      'posts',
    );
    // if (pageDto.page) {
    //   return this.pagePaginatePosts(pageDto);
    // } else {
    //   return this.cursorPaginatePosts(pageDto);
    // }
  }

  async pagePaginatePosts(pageDto: PaginationPostDto) {
    /**
     * data: Data[],
     * total: number,
     * next: ??
     */
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: pageDto.take * (pageDto.page - 1),
      take: pageDto.take,
      order: {
        createdAt: pageDto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(pageDto: PaginationPostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (pageDto.where__id__less_than) {
      where.id = LessThan(pageDto.where__id__less_than);
    } else if (pageDto.where__id__more_than) {
      where.id = MoreThan(pageDto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: pageDto.order__createdAt,
      },
      take: pageDto.take,
    });

    /**
     * 해당 포스트가 0개 이상이면
     * 마지막 포스트 가져오고
     * 아니면 null 반환
     */
    const lastItem =
      posts.length > 0 && posts.length === pageDto.take
        ? posts[posts.length - 1]
        : null;

    /**
     * nextURL
     */

    const PROTOCOL = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const HOST = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);

    if (nextUrl) {
      /**
       * dto의 카값 루핑
       * 키값에 해당하는 벨류 존재하면
       * param 에 그대로 붙여넣기
       */
      for (const key of Object.keys(pageDto)) {
        if (pageDto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, pageDto[key]);
          }
        }
      }

      let key = null;
      if (pageDto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    /**
     * RESPOSNE
     * data: []
     * cursor: {
     *    after: 마지막 데이터 id
     * }
     * count: 응답한 데이터 갯수
     * next: 다음 요청 ㅅ용할 URL
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      ...DEFALUT_POST_FIND_OPTIONS,
      where: {
        id,
      },
    });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel)
      : this.postsRepository;
  }

  async createPosts(
    authorId: number,
    postDto: CreatePostDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);
    const post = repository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      images: [],
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await repository.save(post);

    return newPost;
  }

  async updatePost(id: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;
    const post = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException();
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(id);
    return id;
  }
}
