import { Injectable } from '@nestjs/common'
import { MailService } from 'src/mail/mail.service'
import { verificationEmailTemplate, passwordResetEmailTemplate } from 'src/modules/auth/templates/otp-email.template'

@Injectable()
export class EmailService {
	constructor(private readonly mailService: MailService) { }

	async sendVerificationEmail(to: string, name: string, otp: string): Promise<boolean> {
		return this.mailService.send(
			to,
			'Emailingizni tasdiqlang - OTT Streaming',
			verificationEmailTemplate(name, otp),
		)
	}

	async sendPasswordResetEmail(to: string, name: string, otp: string): Promise<boolean> {
		return this.mailService.send(
			to,
			'Parolni tiklash - OTT Streaming',
			passwordResetEmailTemplate(name, otp),
		)
	}
}
