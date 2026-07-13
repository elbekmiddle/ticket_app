import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Env } from 'src/config/env/env.config';

interface JwtPayload {
	userId: string
	isAdmin?: boolean
}

interface VerifyTokenPayload extends JwtPayload {
	type: 'verify-email'
}

@Injectable()
export class TokenService {
	constructor(private readonly jwtService: JwtService) { }

	async generateTokens(payload: JwtPayload) {
		const accessPromise = this.jwtService.signAsync(payload, {
			secret: Env.JWT_SECRET,
			expiresIn: '15m',
		})
		const refreshPromise = this.jwtService.signAsync(payload, {
			secret: Env.JWT_REFRESH_SECRET,
			expiresIn: '30d',
		})
		const [accessToken, refreshToken] = await Promise.all([accessPromise, refreshPromise])
		return { accessToken, refreshToken }
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
		return this.jwtService.verifyAsync(token, { secret: Env.JWT_REFRESH_SECRET })
	}
}
