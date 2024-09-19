import { FindManyOptions } from 'typeorm';
import { PostsModel } from '../entities/posts.entity';

export const DEFALUT_POST_FIND_OPTIONS: FindManyOptions<PostsModel> = {
  //   relations: ['author', 'images'],
  relations: {
    author: true,
    images: true,
  },
};
