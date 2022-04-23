import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { stringify as queryStringify } from 'qs';
import { LinkDiscordDto } from './dto/link-discord.dto';
import { RedirectUrlDto } from './dto/redirect-url.dto';
import { DiscordOauthResponse } from './interfaces/discord-oauth-response.interface';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/auth/decorators/user.decorator';
import { UserSession } from 'src/auth/interfaces/user-session.interface';

@Controller({ path: 'discord', version: '1' })
export class DiscordController {
  private readonly discordAuthorizeUrl =
    'https://discord.com/api/oauth2/authorize';
  private readonly discordTokenUrl = 'https://discord.com/api/oauth2/token';
  private readonly clientId = '967381507197001728';
  private readonly clientSecret = 'MtNbcZzZzTedIkQISyAjBruf4obgUopy';
  private readonly redirectUrl =
    'http://localhost:8080/api/v1/discord/callback';

  constructor(
    private httpService: HttpService,
    private usersService: UsersService,
  ) {}

  @Get()
  oauthRedirect(): RedirectUrlDto {
    return {
      url: `${this.discordAuthorizeUrl}?client_id=${
        this.clientId
      }&redirect_uri=${encodeURIComponent(
        this.redirectUrl,
      )}&response_type=code&scope=identify`,
    };
  }

  @Post('link')
  async link(
    @User() user: UserSession,
    @Body() dto: LinkDiscordDto,
  ): Promise<void> {
    try {
      const oauthResponse = await firstValueFrom(
        this.httpService.post<DiscordOauthResponse>(
          this.discordTokenUrl,
          queryStringify({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            code: dto.code,
            redirect_uri: this.redirectUrl,
          }),
        ),
      );

      const discordUser = await firstValueFrom(
        this.httpService.get('https://discord.com/api/users/@me', {
          headers: {
            authorization: `${oauthResponse.data.token_type} ${oauthResponse.data.access_token}`,
          },
        }),
      );
      await this.usersService.setDiscordHandle(
        user.walletAddress,
        discordUser.data.username + '#' + discordUser.data.discriminator,
      );
    } catch (e) {
      if (
        e.response.data &&
        e.response.data.error_description &&
        e.response.data.error_description.indexOf('Invalid "code"') !== -1
      ) {
        throw new ForbiddenException('Invalid Discord oauth code');
      }
      throw e;
    }
  }
}
