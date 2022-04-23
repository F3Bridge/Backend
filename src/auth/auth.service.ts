import {
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ethers } from 'ethers';
import { nanoid } from 'nanoid';

import { ChallengeRequestDto } from './dto/challenge-request.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';

@Injectable()
export class AuthService {
  private static readonly CHALLENGE_CACHE_PREFIX = 'f3challenge_';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

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

  async verifyResponse({
    challenge,
    response,
    walletAddress,
  }: ChallengeResponseDto) {
    const lcWalletAddress = walletAddress.toLowerCase();
    const cacheKey = AuthService.CHALLENGE_CACHE_PREFIX + lcWalletAddress;
    const currentChallenge = await this.cacheManager.get(cacheKey);
    if (challenge !== currentChallenge) {
      throw new ForbiddenException('Challenge mismatch');
    }
    const recoveredAddress = ethers.utils.verifyMessage(challenge, response);
    if (recoveredAddress.toLowerCase() !== lcWalletAddress) {
      throw new ForbiddenException('Invalid response');
    }
    await this.cacheManager.del(cacheKey);
  }
}
