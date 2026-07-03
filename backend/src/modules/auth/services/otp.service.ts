import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class OtpService {

	constructor(
		private readonly redis: RedisService,
	) { }

	async generateOtp() { }

	async sendVerificationOtp() { }

	async verifyOtp() { }

	async deleteOtp() { }
}