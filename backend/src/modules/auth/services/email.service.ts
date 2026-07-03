import { Injectable } from '@nestjs/common'
import { verifyEmailTemplate } from 'src/modules/auth/templates/verify-email'

@Injectable()
export class EmailService {

	async sendVerificationEmail(
		name: string,
		email: string,
		otp: string,
	) {
		const html = verifyEmailTemplate(name, otp)
	}

}