import { Injectable } from '@nestjs/common'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class EmailService {
	constructor(private readonly mailService: MailService) { }

	async sendVerificationEmail(to: string, name: string, otp: string) {
		await this.mailService.send(
			to,
			'Emailingizni tasdiqlang - OTT Streaming',
			`<p>Salom, ${name}!</p><p>Tasdiqlash kodi: <b>${otp}</b> (10 daqiqa amal qiladi)</p>`,
		)
	}

	async sendPasswordResetEmail(to: string, name: string, otp: string) {
		await this.mailService.send(
			to,
			'Parolni tiklash - OTT Streaming',
			`<p>Salom, ${name}!</p><p>Parolni tiklash kodi: <b>${otp}</b> (5 daqiqa amal qiladi)</p>`,
		)
	}
}
