import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.conts';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Exclude } from 'class-transformer';

/**
 * id: number
 * nickname: string
 * email:string
 * password: string
 * role: [RolesEnum.USER, RolesEnum.ADMIN]
 */
@Entity()
export class UsersModel extends BaseModel {
  @Column({
    //길이
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      // 여기서 {}로 빈 객체를 전달하거나 첫 번째 매개변수를 생략할 수 있습니다.
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  @Exclude()
  /**
   * request
   * frontend > backend
   * plain object (JSON) > class instance
   *
   * response
   * backend > frontend
   * class instance (dto) > plain object (JSON)
   *
   * toClassOnly > class instance 변환
   * toPlainOnly > plain object 변환
   *
   */
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
