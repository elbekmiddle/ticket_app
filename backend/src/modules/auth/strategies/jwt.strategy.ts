import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Env } from 'src/config/env/env.config';
import { AuthErrorMessages } from 'src/config/errors'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Env.JWT_SECRET,
    });
  }

  async validate(payload: { userId: number}) {
    if (!payload) {
      throw new UnauthorizedException(AuthErrorMessages.INVALID_TOKEN);
    }
    return { id: payload.userId};
  }
}