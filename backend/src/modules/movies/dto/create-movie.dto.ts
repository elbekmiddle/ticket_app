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

	@ApiProperty({ example: 'https://cdn.example.com/posters/interstellar.jpg', required: false })
	posterUrl?: string

	@ApiProperty({ example: 'https://cdn.example.com/videos/interstellar/master.m3u8', required: false })
	videoUrl?: string

	@ApiProperty({ example: 6, description: 'Nechi oydan keyin yuklab olish ochiladi (premyera uchun)', required: false })
	downloadUnlockMonths?: number
}
