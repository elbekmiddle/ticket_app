interface BaseEmailOptions {
	previewText: string
	heading: string
	bodyHtml: string
}

// Email klientlar (Gmail, Outlook va h.k.) ko'pincha <style> tegini o'chirib tashlaydi,
// shuning uchun barcha CSS inline yozilgan — bu email HTML yozishning standart talabi.
export function baseEmailTemplate({ previewText, heading, bodyHtml }: BaseEmailOptions) {
	return `
<!DOCTYPE html>
<html lang="uz">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${heading}</title>
</head>
<body style="margin:0; padding:0; background-color:#0b0b0f; font-family: 'Helvetica Neue', Arial, sans-serif;">
	<!-- Gmail/Outlook preview matni (ko'zga ko'rinmaydi, faqat inbox preview'da chiqadi) -->
	<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>

	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0f; padding:32px 16px;">
		<tr>
			<td align="center">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#15151d; border-radius:16px; overflow:hidden; border:1px solid #23232e;">

					<!-- Header / Logo -->
					<tr>
						<td style="padding:32px 32px 0 32px;" align="center">
							<div style="display:inline-block; width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#7c3aed,#db2777); text-align:center; line-height:44px; font-size:20px;">
								🎬
							</div>
							<div style="margin-top:12px; color:#f4f4f5; font-size:15px; font-weight:600; letter-spacing:0.5px;">
								OTT STREAMING
							</div>
						</td>
					</tr>

					<!-- Body -->
					<tr>
						<td style="padding:28px 32px 8px 32px;">
							<h1 style="margin:0 0 16px 0; color:#ffffff; font-size:20px; font-weight:600; text-align:center;">
								${heading}
							</h1>
							${bodyHtml}
						</td>
					</tr>

					<!-- Footer -->
					<tr>
						<td style="padding:24px 32px 32px 32px;">
							<div style="border-top:1px solid #23232e; padding-top:20px; text-align:center;">
								<p style="margin:0; color:#6b6b76; font-size:12px; line-height:18px;">
									Bu xabarni siz OTT Streaming'da ro'yxatdan o'tganingiz yoki<br />
									parolni tiklashni so'raganingiz uchun oldingiz.
								</p>
								<p style="margin:8px 0 0 0; color:#4b4b55; font-size:11px;">
									Agar bu siz bo'lmasangiz, xabarni e'tiborsiz qoldirishingiz mumkin.
								</p>
							</div>
						</td>
					</tr>

				</table>

				<p style="margin:20px 0 0 0; color:#4b4b55; font-size:11px;">
					© ${new Date().getFullYear()} OTT Streaming
				</p>
			</td>
		</tr>
	</table>
</body>
</html>
`.trim()
}
