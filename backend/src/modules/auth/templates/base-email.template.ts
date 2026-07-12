interface BaseEmailOptions {
  previewText: string;
  heading: string;
  bodyHtml: string;
}

export function baseEmailTemplate({
  previewText,
  heading,
  bodyHtml,
}: BaseEmailOptions) {
  return `
<!DOCTYPE html>
<html lang="uz">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${heading}</title>
</head>

<body style="
	margin:0;
	padding:0;
	background-color:#f6f7fb;
	font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
">

	<!-- Preview text -->
	<div style="
		display:none;
		max-height:0;
		overflow:hidden;
		opacity:0;
		color:transparent;
	">
		${previewText}
	</div>


	<table 
		role="presentation"
		width="100%"
		cellpadding="0"
		cellspacing="0"
		style="
			background-color:#f6f7fb;
			padding:40px 16px;
		"
	>
		<tr>
			<td align="center">

				<table
					role="presentation"
					width="100%"
					cellpadding="0"
					cellspacing="0"
					style="
						max-width:480px;
						background:#ffffff;
						border-radius:20px;
						border:1px solid #e8e8ef;
						overflow:hidden;
					"
				>

					<!-- Header -->
					<tr>
						<td
							align="center"
							style="
								padding:36px 32px 24px;
							"
						>

							<div style="
								width:48px;
								height:48px;
								border-radius:14px;
								background:#111827;
								color:#ffffff;
								font-size:18px;
								font-weight:700;
								line-height:48px;
								text-align:center;
								margin-bottom:16px;
							">
								O
							</div>


							<div style="
								font-size:15px;
								font-weight:700;
								letter-spacing:0.8px;
								color:#111827;
							">
								OTT STREAMING
							</div>

						</td>
					</tr>


					<!-- Content -->
					<tr>
						<td
							style="
								padding:0 32px 32px;
							"
						>

							<h1 style="
								margin:0 0 18px;
								font-size:24px;
								line-height:32px;
								font-weight:700;
								color:#111827;
								text-align:center;
							">
								${heading}
							</h1>


							<div style="
								font-size:15px;
								line-height:24px;
								color:#4b5563;
							">
								${bodyHtml}
							</div>

						</td>
					</tr>


					<!-- Divider -->
					<tr>
						<td style="padding:0 32px;">
							<div style="
								height:1px;
								background:#eeeeee;
							"></div>
						</td>
					</tr>


					<!-- Footer -->
					<tr>
						<td
							align="center"
							style="
								padding:24px 32px 32px;
							"
						>

							<p style="
								margin:0;
								font-size:12px;
								line-height:18px;
								color:#9ca3af;
							">
								Siz ushbu xabarni OTT Streaming akkauntingiz bilan bog'liq
								amal uchun oldingiz.
							</p>


							<p style="
								margin:10px 0 0;
								font-size:12px;
								color:#c0c4cc;
							">
								Agar bu amalni siz bajarmagan bo'lsangiz,
								xabarni e'tiborsiz qoldiring.
							</p>

						</td>
					</tr>

				</table>


				<p style="
					margin:24px 0 0;
					font-size:12px;
					color:#9ca3af;
				">
					© ${new Date().getFullYear()} OTT Streaming
				</p>


			</td>
		</tr>
	</table>

</body>
</html>
`.trim();
}
