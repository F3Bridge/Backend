import { IsString } from 'class-validator';

export class AuthTokensDto {
  @IsString()
  refreshToken: string;

  @IsString()
  accessToken: string;
}
