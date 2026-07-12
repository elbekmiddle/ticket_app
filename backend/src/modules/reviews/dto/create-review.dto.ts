import { ApiProperty } from '@nestjs/swagger'

export class CreateReviewDto {
	@ApiProperty({ example: 'a3f1c2e4-...' })
	movieId!: string

	@ApiProperty({ example: 5, minimum: 1, maximum: 5 })
	rating!: number

	@ApiProperty({ example: 'Ajoyib film, tavsiya qilaman!' })
	comment!: string
}
