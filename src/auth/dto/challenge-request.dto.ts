import { IsString, Length } from 'class-validator';

export class ChallengeRequestDto {
  @IsString()
  @Length(42, 42)
  walletAddress: string;
}
