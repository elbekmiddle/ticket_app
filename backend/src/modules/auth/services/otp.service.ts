import { Injectable, BadRequestException } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AuthErrorMessages } from 'src/config/errors'

const MAX_OTP_ATTEMPTS = 5
const ATTEMPTS_TTL_SECONDS = 300

@Injectable()
export class OtpService {
	constructor(private readonly redis: RedisService) { }

	private getKey(userId: string) {
		return `otp:verify:${userId}`
	}

	private getAttemptsKey(userId: string) {
		return `otp:attempts:${userId}`
	}

	generateOtp() {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	async sendVerificationOtp(userId: string, email: string) {
		const otp = this.generateOtp()
		await this.redis.set(this.getKey(userId), otp, 300)
		await this.redis.del(this.getAttemptsKey(userId))
		return otp
	}

	async verifyOtp(userId: string, otp: string) {
		const attemptsKey = this.getAttemptsKey(userId)
		const attempts = await this.redis.incr(attemptsKey)

		if (attempts === 1) {
			await this.redis.expire(attemptsKey, ATTEMPTS_TTL_SECONDS)
		}

		if (attempts > MAX_OTP_ATTEMPTS) {
			throw new BadRequestException(AuthErrorMessages.OTP_TOO_MANY_ATTEMPTS)
		}

		const savedOtp = await this.redis.get(this.getKey(userId))

		if (!savedOtp) {
			throw new BadRequestException(AuthErrorMessages.OTP_EXPIRED)
		}

		if (savedOtp !== otp) {
			throw new BadRequestException(AuthErrorMessages.INVALID_OTP)
		}

		await this.redis.del(attemptsKey)

		return true
	}

	async deleteOtp(userId: string) {
		await this.redis.del(this.getKey(userId))
	}
}
