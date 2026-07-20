import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Env } from 'src/config/env/env.config';
import { RedisService } from 'src/redis/redis.service';
import { AuthErrorMessages } from 'src/config/errors';

interface JwtPayload {
	userId: string
	isAdmin?: boolean
}

interface RefreshJwtPayload extends JwtPayload {
	jti: string
}

interface VerifyTokenPayload extends JwtPayload {
	type: 'verify-email'
}

const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60

@Injectable()
export class TokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly redis: RedisService,
	) { }

	private getSessionKey(userId: string) {
		return `refresh:session:${userId}`
	}

	// Har foydalanuvchi uchun bitta "faol" refresh token (jti) Redis'da saqlanadi.
	// Yangi token chiqarilganda eskisi avtomatik almashadi (rotate) — shuning uchun
	// login/refresh qilingan zahoti eski refresh token endi ishlamay qoladi.
	async generateTokens(payload: JwtPayload) {
		const jti = randomUUID()

		const accessPromise = this.jwtService.signAsync(payload, {
			secret: Env.JWT_SECRET,
			expiresIn: '15m',
		})
		const refreshPromise = this.jwtService.signAsync({ ...payload, jti }, {
			secret: Env.JWT_REFRESH_SECRET,
			expiresIn: '30d',
		})
		const [accessToken, refreshToken] = await Promise.all([accessPromise, refreshPromise])

		await this.redis.set(this.getSessionKey(payload.userId), jti, REFRESH_TOKEN_TTL_SECONDS)

		return { accessToken, refreshToken }
	}

	async revokeSession(userId: string) {
		await this.redis.del(this.getSessionKey(userId))
	}

	async generateVerificationToken(userId: string) {
		return this.jwtService.signAsync(
			{ userId, type: 'verify-email' },
			{ secret: Env.JWT_SECRET, expiresIn: '10m' },
		)
	}

	async verifyVerificationToken(token: string): Promise<VerifyTokenPayload> {
		return this.jwtService.verifyAsync(token, { secret: Env.JWT_SECRET })
	}

	async verifyRefreshToken(token: string): Promise<JwtPayload> {
		const payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(token, {
			secret: Env.JWT_REFRESH_SECRET,
		})

		const activeJti = await this.redis.get(this.getSessionKey(payload.userId))

		// Token imzosi/muddati to'g'ri bo'lsa ham, agar bu jti endi "faol" sessiya
		// bo'lmasa (logout qilingan yoki allaqachon rotate qilinib eskirgan) — rad etamiz.
		if (!activeJti || activeJti !== payload.jti) {
			throw new UnauthorizedException(AuthErrorMessages.INVALID_TOKEN)
		}

		return payload
	}
}
