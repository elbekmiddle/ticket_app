import { ApiProperty } from '@nestjs/swagger'

export class UpdateMovieDto {
	@ApiProperty({ required: false }) title?: string
	@ApiProperty({ required: false }) description?: string
	@ApiProperty({ required: false }) posterUrl?: string
	@ApiProperty({ required: false }) videoUrl?: string
	@ApiProperty({ required: false }) price?: number
}
