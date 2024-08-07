import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.conts';
import { PostsModel } from 'src/posts/entities/posts.entity';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

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
