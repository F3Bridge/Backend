import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { DiscordController } from './discord.controller';

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [DiscordController],
})
export class DiscordModule {}
