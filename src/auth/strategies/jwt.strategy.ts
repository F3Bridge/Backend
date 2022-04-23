import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigKeys } from 'src/config-keys.const';
import { UserSession } from '../interfaces/user-session.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(ConfigKeys.JwtSecret),
    });
  }

  async validate(payload: any): Promise<UserSession> {
    return { walletAddress: payload.sub };
  }
}
