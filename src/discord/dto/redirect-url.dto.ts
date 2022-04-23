import { IsString } from 'class-validator';

export class RedirectUrlDto {
  @IsString()
  url: string;
}
