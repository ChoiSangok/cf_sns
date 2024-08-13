import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.conts';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';

/**
 * id: number
 * nickname: string
 * email:string
 * password: string
 * role: [RolesEnum.USER, RolesEnum.ADMIN]
 *
 *
 */
@Entity()
export class UsersModel extends BaseModel {
  @Column({
    //길이
    length: 20,
    unique: true,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
