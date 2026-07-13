import { ApiProperty } from '@nestjs/swagger'

export class UpdateMovieDto {
	@ApiProperty({ required: false }) title?: string
	@ApiProperty({ required: false }) description?: string
	@ApiProperty({ required: false, description: 'Faqat bizning CDN domenimizdan' }) posterUrl?: string
	@ApiProperty({ required: false, description: 'Faqat bizning CDN domenimizdan' }) videoUrl?: string
	@ApiProperty({ required: false }) price?: number
	@ApiProperty({ required: false, example: '2026-12-25T00:00:00Z' }) downloadUnlockAt?: string
	@ApiProperty({ required: false, example: 6 }) downloadUnlockMonths?: number
}
