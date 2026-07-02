import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Env } from 'src/config/env/env.config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) { }

  async generateTokens(payload: { userId: string }) {
    console.time("access")

    const accessPromise = this.jwtService.signAsync(payload, {
      secret: Env.JWT_SECRET,
      expiresIn: "15m",
    })

    console.time("refresh")

    const refreshPromise = this.jwtService.signAsync(payload, {
      secret: Env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    })

    const accessToken = await accessPromise
    console.timeEnd("access")

    const refreshToken = await refreshPromise
    console.timeEnd("refresh")

    return {
      accessToken,
      refreshToken,
    }
  }
}