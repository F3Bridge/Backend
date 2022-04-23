import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChallengeRequestDto } from './dto/challenge-request.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { ChallengeDto } from './dto/challenge.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  createChallenge(@Body() dto: ChallengeRequestDto): Promise<ChallengeDto> {
    return this.authService.createChallenge(dto);
  }

  @Post('verify')
  @HttpCode(200)
  verifyResponse(@Body() dto: ChallengeResponseDto): Promise<void> {
    return this.authService.verifyResponse(dto);
  }
}
