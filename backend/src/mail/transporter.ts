import nodemailer from 'nodemailer'
import { Env } from 'src/config/env/env.config'

export const transporter = nodemailer.createTransport({
	host: Env.SMTP_HOST,
	port: Env.SMTP_PORT,
	secure: Env.SMTP_PORT === 465,
	auth: {
		user: Env.SMTP_USER,
		pass: Env.SMTP_PASSWORD,
	},
})
