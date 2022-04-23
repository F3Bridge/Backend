import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { UserSession } from 'src/auth/interfaces/user-session.interface';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('/me')
  findMe(@User() user: UserSession) {
    return this.usersService.findOneOrFail(user.walletAddress);
  }

  @Get('/by-discord/:discordHandle')
  @Public()
  findOneByDiscord(@Param('discordHandle') discordHandle: string) {
    return this.usersService.findOneByDiscordHandleOrFail(discordHandle);
  }

  @Get('/:walletAddress')
  @Public()
  findOne(@Param('walletAddress') walletAddress: string) {
    return this.usersService.findOneOrFail(walletAddress);
  }
}
