import { Injectable, BadRequestException } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AuthErrorMessages } from 'src/config/errors'

@Injectable()
export class OtpService {
	constructor(private readonly redis: RedisService) { }

	private getKey(userId: string) {
		return `otp:verify:${userId}`
	}

	generateOtp() {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	async sendVerificationOtp(userId: string, email: string) {
		const otp = this.generateOtp()
		await this.redis.set(this.getKey(userId), otp, 300)
		return otp
	}

	async verifyOtp(userId: string, otp: string) {
		const savedOtp = await this.redis.get(this.getKey(userId))

		if (!savedOtp) {
			throw new BadRequestException(AuthErrorMessages.OTP_EXPIRED)
		}

		if (savedOtp !== otp) {
			throw new BadRequestException(AuthErrorMessages.INVALID_OTP)
		}

		return true
	}

	async deleteOtp(userId: string) {
		await this.redis.del(this.getKey(userId))
	}
}
