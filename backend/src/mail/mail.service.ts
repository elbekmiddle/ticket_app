import { Injectable, Logger } from '@nestjs/common'
import { transporter } from './transporter'
import { Env } from 'src/config/env/env.config'

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name)

	async send(to: string, subject: string, html: string) {
		try {
			await transporter.sendMail({
				from: Env.SMTP_FROM,
				to,
				subject,
				html,
			})
		} catch (err) {
			this.logger.error(`Failed to send email to ${to}`, err as Error)
		}
	}
}
