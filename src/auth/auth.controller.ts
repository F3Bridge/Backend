import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { ChallengeRequestDto } from './dto/challenge-request.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { ChallengeDto } from './dto/challenge.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @Public()
  createChallenge(@Body() dto: ChallengeRequestDto): Promise<ChallengeDto> {
    return this.authService.createChallenge(dto);
  }

  @Post('verify')
  @Public()
  @HttpCode(200)
  verifyResponse(@Body() dto: ChallengeResponseDto): Promise<AuthTokensDto> {
    return this.authService.verifyResponse(dto);
  }
}
