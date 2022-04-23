import { IsString, Length } from 'class-validator';

export class ChallengeDto {
  @IsString()
  challenge: string;

  @IsString()
  @Length(42, 42)
  walletAddress: string;
}
