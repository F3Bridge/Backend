import {
  BadRequestException,
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { ethers, utils } from 'ethers';
import { nanoid } from 'nanoid';
import { UsersService } from 'src/users/users.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { AuthTokensDto } from './dto/auth-tokens.dto';

import { ChallengeRequestDto } from './dto/challenge-request.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';

@Injectable()
export class AuthService {
  private static readonly CHALLENGE_CACHE_PREFIX = 'f3challenge_';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async createChallenge({ walletAddress }: ChallengeRequestDto) {
    const challenge =
      `This is an authentication challenge for F3Bridge for address ${walletAddress}.\n\n` +
      `Do not modify this message and sign as-is.\n\n${nanoid(64)}`;
    await this.cacheManager.set(
      AuthService.CHALLENGE_CACHE_PREFIX + walletAddress.toLowerCase(),
      challenge,
      { ttl: 60 * 60 * 24 },
    );
    return { challenge, walletAddress };
  }

  @Transactional()
  async verifyResponse({
    challenge,
    response,
    walletAddress,
  }: ChallengeResponseDto): Promise<AuthTokensDto> {
    try {
      walletAddress = utils.getAddress(walletAddress);
    } catch (e) {
      throw new BadRequestException('Invalid wallet address');
    }
    const lcWalletAddress = walletAddress.toLowerCase();
    const cacheKey = AuthService.CHALLENGE_CACHE_PREFIX + lcWalletAddress;
    const currentChallenge = await this.cacheManager.get(cacheKey);
    if (challenge !== currentChallenge) {
      throw new ForbiddenException('Challenge mismatch');
    }
    try {
      const recoveredAddress = ethers.utils.verifyMessage(challenge, response);
      if (recoveredAddress.toLowerCase() !== lcWalletAddress) {
        throw new ForbiddenException('Invalid response');
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
    // TODO: uncomment
    // await this.cacheManager.del(cacheKey);
    if (!(await this.usersService.findOne(walletAddress))) {
      await this.usersService.create(walletAddress);
    }
    const refreshToken = await this.usersService.rotateRefreshToken(
      walletAddress,
    );
    return {
      refreshToken,
      accessToken: await this.signJwtFor(walletAddress),
    };
  }

  async refresh(refreshToken: string) {
    const user = await this.usersService.findOneByRefreshTokenOrFail(
      refreshToken,
    );
    return this.signJwtFor(user.walletAddress);
  }

  private async signJwtFor(walletAddress: string) {
    return this.jwtService.sign({ sub: walletAddress });
  }
}
