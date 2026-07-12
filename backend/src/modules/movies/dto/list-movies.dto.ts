import { ApiProperty } from '@nestjs/swagger'

export class ListMoviesDto {
	@ApiProperty({ required: false, example: 1 })
	page?: number

	@ApiProperty({ required: false, example: 20 })
	limit?: number

	@ApiProperty({ required: false, example: 'inter', description: 'Nomi bo\'yicha qidiruv' })
	search?: string

	@ApiProperty({ required: false, example: true })
	isPremiere?: boolean
}
