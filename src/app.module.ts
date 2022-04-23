import {
  CacheModule,
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

import { AuthModule } from './auth/auth.module';
import { ConfigKeys } from './config-keys.const';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>(ConfigKeys.RedisHost),
        port: configService.get<number>(ConfigKeys.RedisPort, 6379),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(),
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
  ],
})
export class AppModule {}
