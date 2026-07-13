import { ApiProperty } from '@nestjs/swagger'

export class CreateMovieDto {
	@ApiProperty({ example: 'Interstellar' })
	title!: string

	@ApiProperty({ example: 'Fazoviy sayohat haqida film', required: false })
	description?: string

	@ApiProperty({ example: false, description: 'Premyera kinomi (Pay-Per-View)' })
	isPremiere!: boolean

	@ApiProperty({ example: '2026-08-01T18:00:00Z', required: false })
	premiereDate?: string

	@ApiProperty({ example: 49000, description: 'Chipta narxi (so\'m), faqat premyera uchun', required: false })
	price?: number

	@ApiProperty({ example: 'https://d111111abcdef8.cloudfront.net/posters/interstellar.jpg', description: 'Faqat bizning CDN domenimizdan', required: false })
	posterUrl?: string

	@ApiProperty({ example: 'https://d111111abcdef8.cloudfront.net/videos/interstellar/master.m3u8', description: 'Faqat bizning CDN domenimizdan', required: false })
	videoUrl?: string

	@ApiProperty({ example: '2026-12-25T00:00:00Z', description: 'Aniq sana — berilsa, downloadUnlockMonths\'dan ustun turadi', required: false })
	downloadUnlockAt?: string

	@ApiProperty({ example: 6, description: 'Nisbiy: premiereDate + N oy (faqat downloadUnlockAt berilmasa ishlatiladi)', required: false })
	downloadUnlockMonths?: number
}
