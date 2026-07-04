import { Injectable } from "@nestjs/common"
import * as nodemailer from "nodemailer"
import { Env } from "src/config/env/env.config"

@Injectable()
export class EmailService {

	private transporter = nodemailer.createTransport({
		host: Env.SMTP_HOST,
		port: Number(Env.SMTP_PORT),
		requireTLS: true,
		secure: false,
		auth: {
			user: Env.SMTP_USER,
			pass: Env.SMTP_PASSWORD,
		},
	});

	async sendVerificationEmail(
		email: string,
		name: string,
		otp: string,
	) {
		await this.transporter.sendMail({
			from: Env.SMTP_FROM,
			to: email,
			subject: "Verify your email",
			html: this.getVerifyTemplate(name, otp),
		})
	}

	private getVerifyTemplate(name: string, otp: string) {
		return `
<!DOCTYPE html>
<html>

<body style="
background:#f5f7fb;
padding:40px;
font-family:Arial;
">

<table
style="
max-width:600px;
margin:auto;
background:#fff;
border-radius:18px;
padding:40px;
">

<tr>
<td align="center">

<h1 style="margin:0">
Ticket App
</h1>

<p
style="
font-size:16px;
color:#666;
">
Verify your email address
</p>

</td>
</tr>

<tr>

<td>

<p>Hello <b>${name}</b>,</p>

<p>
Use the verification code below.
</p>

<div
style="
margin:30px 0;
text-align:center;
">

<span
style="
display:inline-block;
padding:20px 40px;
font-size:34px;
letter-spacing:10px;
font-weight:bold;
background:#f3f4f6;
border-radius:12px;
">
${otp}
</span>

</div>

<p>
The code expires in
<b>10 minutes</b>.
</p>

<p>
If you didn't create an account,
ignore this email.
</p>

</td>

</tr>

</table>

</body>
</html>
`
	}

}