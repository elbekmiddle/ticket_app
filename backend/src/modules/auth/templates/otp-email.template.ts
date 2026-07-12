import { baseEmailTemplate } from './base-email.template'

function otpCodeBlock(otp: string) {
	return `
		<div style="margin:24px 0; text-align:center;">
			<div style="display:inline-block; padding:16px 28px; background-color:#0b0b0f; border:1px dashed #3f3f4a; border-radius:10px;">
				<span style="color:#ffffff; font-size:32px; font-weight:700; letter-spacing:8px; font-family: 'Courier New', monospace;">
					${otp}
				</span>
			</div>
		</div>
	`
}

export function verificationEmailTemplate(name: string, otp: string) {
	const bodyHtml = `
		<p style="margin:0 0 4px 0; color:#c4c4cc; font-size:14px; line-height:22px; text-align:center;">
			Salom, <strong style="color:#ffffff;">${name}</strong>!
		</p>
		<p style="margin:0; color:#c4c4cc; font-size:14px; line-height:22px; text-align:center;">
			Ro'yxatdan o'tishni yakunlash uchun quyidagi kodni kiriting:
		</p>

		${otpCodeBlock(otp)}

		<p style="margin:0; color:#8b8b96; font-size:13px; line-height:20px; text-align:center;">
			Kod <strong style="color:#c4c4cc;">10 daqiqa</strong> davomida amal qiladi.
		</p>
	`

	return baseEmailTemplate({
		previewText: `Tasdiqlash kodingiz: ${otp}`,
		heading: 'Emailingizni tasdiqlang',
		bodyHtml,
	})
}

export function passwordResetEmailTemplate(name: string, otp: string) {
	const bodyHtml = `
		<p style="margin:0 0 4px 0; color:#c4c4cc; font-size:14px; line-height:22px; text-align:center;">
			Salom, <strong style="color:#ffffff;">${name}</strong>!
		</p>
		<p style="margin:0; color:#c4c4cc; font-size:14px; line-height:22px; text-align:center;">
			Parolni tiklash uchun so'rov yubordingiz. Quyidagi kodni kiriting:
		</p>

		${otpCodeBlock(otp)}

		<p style="margin:0 0 12px 0; color:#8b8b96; font-size:13px; line-height:20px; text-align:center;">
			Kod <strong style="color:#c4c4cc;">5 daqiqa</strong> davomida amal qiladi.
		</p>

		<div style="margin-top:16px; padding:12px 16px; background-color:#2a1a1a; border-radius:8px; border:1px solid #4a2a2a;">
			<p style="margin:0; color:#e59a9a; font-size:12px; line-height:18px; text-align:center;">
				Agar siz bu so'rovni yubormagan bo'lsangiz, hisobingiz xavfsiz —
				shunchaki bu xabarni e'tiborsiz qoldiring.
			</p>
		</div>
	`

	return baseEmailTemplate({
		previewText: `Parolni tiklash kodingiz: ${otp}`,
		heading: 'Parolni tiklash',
		bodyHtml,
	})
}
