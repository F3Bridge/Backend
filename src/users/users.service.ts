import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(walletAddress: string) {
    const user = new User();
    user.walletAddress = walletAddress;
    await this.userRepository.save(user);
  }

  findOne(walletAddress: string): Promise<User | null> {
    return this.userRepository.findOne(walletAddress);
  }

  findOneOrFail(walletAddress: string): Promise<User> {
    return this.userRepository.findOneOrFail(walletAddress);
  }

  findOneByRefreshTokenOrFail(refreshToken: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { refreshToken } });
  }

  async rotateRefreshToken(walletAddress: string): Promise<string> {
    const user = await this.findOneOrFail(walletAddress);
    const refreshToken = nanoid(128);
    user.refreshToken = createHash('sha256').update(refreshToken).digest('hex');
    await this.userRepository.save(user);
    return refreshToken;
  }
}
