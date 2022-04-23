import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Transactional()
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

  findOneByDiscordHandleOrFail(discordHandle: string) {
    return this.userRepository.findOneOrFail({
      where: {
        discordHandle: createHash('sha256').update(discordHandle).digest('hex'),
      },
    });
  }

  @Transactional()
  async setDiscordHandle(walletAddress: string, discordHandle: string) {
    const existingDiscordTagOwner = await this.userRepository.findOne({
      where: { discordHandle },
    });
    const user = await this.findOneOrFail(walletAddress);
    if (existingDiscordTagOwner) {
      existingDiscordTagOwner.discordHandle = null;
      await this.userRepository.save(existingDiscordTagOwner);
    }
    user.discordHandle = createHash('sha256')
      .update(discordHandle)
      .digest('hex');
    await this.userRepository.save(user);
  }

  @Transactional()
  async rotateRefreshToken(walletAddress: string): Promise<string> {
    const user = await this.findOneOrFail(walletAddress);
    const refreshToken = nanoid(128);
    user.refreshToken = createHash('sha256').update(refreshToken).digest('hex');
    await this.userRepository.save(user);
    return refreshToken;
  }
}
