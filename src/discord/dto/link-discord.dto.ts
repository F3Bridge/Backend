import { IsString } from 'class-validator';

export class LinkDiscordDto {
  @IsString()
  code: string;
}
