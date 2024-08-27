import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    // 1. nickname 중복이 없는지 확인
    // exist() > 만약에 조건에 해당되는 값이 있으면 true 반환
    const nicknameExists = await this.userRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });
    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 닉네임');
    }

    const emailExists = await this.userRepository.exists({
      where: {
        email: user.email,
      },
    });
    if (emailExists) {
      throw new BadRequestException('이미 존재하는 이메일');
    }

    const userObject = this.userRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.userRepository.save(userObject);

    return newUser;
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  /**
   * 전체조회
   */
  async getAllUsers() {
    return this.userRepository.find();
  }
}
