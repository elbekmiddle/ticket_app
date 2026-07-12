import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Env } from 'src/config/env/env.config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) { }

  async generateTokens(payload: { userId: string }) {
    const accessPromise = this.jwtService.signAsync(payload, {

      secret: Env.JWT_SECRET,
      expiresIn: "15m",
    })
    const refreshPromise = this.jwtService.signAsync(payload, {
      secret: Env.JWT_REFRESH_SECRET,
      expiresIn: "30d",
    })
    const accessToken = await accessPromise
    const refreshToken = await refreshPromise
    return {
      accessToken,
      refreshToken,
    }
  }
  async generateVerificationToken(userId: string) {
    return this.jwtService.signAsync(
      {
        userId,
        type: "verify-email",
      },
      {
        secret: Env.JWT_SECRET,
        expiresIn: "10m",
      },
    )
  }
  async verifyVerificationToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: Env.JWT_SECRET,
    })
  }
}