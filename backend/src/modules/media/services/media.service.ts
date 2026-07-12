import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { Env } from 'src/config/env/env.config'
import { UploadUrlInput } from '../schemas/upload-url.schema'

const UPLOAD_URL_EXPIRY_SECONDS = 15 * 60 // presigned PUT URL 15 daqiqa amal qiladi

@Injectable()
export class MediaService {
	private readonly logger = new Logger(MediaService.name)
	private readonly s3: S3Client | null

	constructor() {
		// AWS hali sozlanmagan bo'lsa ham ilova ishga tushaveradi (env optional) —
		// faqat shu endpoint chaqirilganda aniq xato beriladi, butun server yiqilmaydi.
		this.s3 = Env.AWS_ACCESS_KEY_ID && Env.AWS_SECRET_ACCESS_KEY && Env.AWS_REGION
			? new S3Client({
				region: Env.AWS_REGION,
				credentials: {
					accessKeyId: Env.AWS_ACCESS_KEY_ID,
					secretAccessKey: Env.AWS_SECRET_ACCESS_KEY,
				},
			})
			: null
	}

	// Admin frontend'i shu presigned URL'ga to'g'ridan-to'g'ri (backend orqali emas,
	// browser'dan bevosita S3'ga) katta video faylni PUT qiladi — backend orqali
	// o'tkazish (proxy) katta fayllar uchun sekin va xotira sarflaydi, presigned URL esa yo'q.
	async getUploadUrl(dto: UploadUrlInput) {
		if (!this.s3 || !Env.AWS_S3_BUCKET) {
			throw new InternalServerErrorException('AWS_NOT_CONFIGURED')
		}

		const extension = dto.fileName.split('.').pop()
		const key = `videos/${randomUUID()}.${extension}`

		const command = new PutObjectCommand({
			Bucket: Env.AWS_S3_BUCKET,
			Key: key,
			ContentType: dto.contentType,
		})

		const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS })

		// CloudFront sozlangan bo'lsa CDN orqali, bo'lmasa S3 to'g'ridan-to'g'ri manzili
		// (ikkalasi ham "final video_url" sifatida movie.videoUrl'ga qo'yiladi)
		const cdnUrl = Env.AWS_CLOUDFRONT_DOMAIN
			? `https://${Env.AWS_CLOUDFRONT_DOMAIN}/${key}`
			: `https://${Env.AWS_S3_BUCKET}.s3.${Env.AWS_REGION}.amazonaws.com/${key}`

		this.logger.log(`Presigned upload URL generated for key=${key}`)

		return { uploadUrl, cdnUrl, key, expiresInSeconds: UPLOAD_URL_EXPIRY_SECONDS }
	}
}
