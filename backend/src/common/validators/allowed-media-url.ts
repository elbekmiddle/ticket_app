import { Env } from 'src/config/env/env.config'

// Faqat o'zimizning CloudFront (yoki CloudFront sozlanmagan bo'lsa, S3 to'g'ridan-to'g'ri)
// domenidan kelgan video/rasm URL'lari qabul qilinadi. Tashqi (arbitrary) URL'larni
// movie.videoUrl / posterUrl sifatida qabul qilish xavfsizlik nuqtai nazaridan yomon:
// - boshqa saytdagi kontentni "o'zimiznikidek" ko'rsatish mumkin bo'lardi
// - hotlinking/SSRF-ga o'xshash noaniq xatti-harakatlarga yo'l ochadi
// - narx/kirish nazorati (checkAccess) faqat bizning CDN orqali kelgan kontent uchun ma'noli
function getAllowedHosts(): string[] {
	const hosts: string[] = []

	if (Env.AWS_CLOUDFRONT_DOMAIN) {
		hosts.push(Env.AWS_CLOUDFRONT_DOMAIN)
	}

	if (Env.AWS_S3_BUCKET && Env.AWS_REGION) {
		hosts.push(`${Env.AWS_S3_BUCKET}.s3.${Env.AWS_REGION}.amazonaws.com`)
	}

	return hosts
}

export function isAllowedMediaUrl(url: string): boolean {
	// Faqat local development'da, AWS hali sozlanmagan bo'lsa, tekshiruvni o'chirib turish mumkin —
	// production'da bu flag albatta false bo'lishi kerak.
	if (Env.ALLOW_EXTERNAL_MEDIA_URLS) {
		return true
	}

	const allowedHosts = getAllowedHosts()

	if (allowedHosts.length === 0) {
		// AWS umuman sozlanmagan — hech qanday URL qabul qilinmaydi (xavfsiz default)
		return false
	}

	try {
		const { hostname } = new URL(url)
		return allowedHosts.includes(hostname)
	} catch {
		return false
	}
}
