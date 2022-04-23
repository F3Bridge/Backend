import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { DiscordController } from './discord.controller';

@Module({
  imports: [ConfigModule, HttpModule, UsersModule],
  controllers: [DiscordController],
})
export class DiscordModule {}
