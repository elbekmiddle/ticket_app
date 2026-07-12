// Email yuborishni kutamiz, lekin cheksiz emas — agar Resend sekinlashsa yoki
// osilib qolsa, N millisekunddan keyin "false" bilan davom etamiz. Shunda
// register/forgot-password endpoint hech qachon email provayderiga qarab
// bir necha soniyadan ortiq osilib qolmaydi, lekin oddiy holatda (tez javob
// bo'lganda) haqiqiy natijani (true/false) response'ga chiqara olamiz.
export async function withTimeout<T>(
	promise: Promise<T>,
	ms: number,
	fallback: T,
): Promise<T> {
	let timer: NodeJS.Timeout

	const timeout = new Promise<T>((resolve) => {
		timer = setTimeout(() => resolve(fallback), ms)
	})

	try {
		return await Promise.race([promise, timeout])
	} finally {
		clearTimeout(timer!)
	}
}
