import { IsString, Length } from 'class-validator';

export class ChallengeResponseDto {
  @IsString()
  challenge: string;

  @IsString()
  response: string;

  @IsString()
  @Length(42, 42)
  walletAddress: string;
}
