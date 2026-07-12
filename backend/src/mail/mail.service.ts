import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'
import { Env } from 'src/config/env/env.config'

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name)
	private readonly resend = new Resend(Env.RESEND_API_KEY)

	// Endi boolean qaytaradi — chaqiruvchi tomon (masalan AuthService)
	// "email haqiqatan yuborildimi" degan holatni response'ga chiqarishi mumkin,
	// shunda frontend "OTP kelmasa, qayta yuboring" tugmasini to'g'ri vaqtda ko'rsata oladi.
	async send(to: string, subject: string, html: string): Promise<boolean> {
		try {
			const { error } = await this.resend.emails.send({
				from: Env.MAIL_FROM,
				to,
				subject,
				html,
			})

			if (error) {
				this.logger.error(`Resend error sending to ${to}: ${error.message}`)
				return false
			}

			return true
		} catch (err) {
			this.logger.error(`Failed to send email to ${to}`, err as Error)
			return false
		}
	}
}
