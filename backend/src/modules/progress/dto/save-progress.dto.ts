import { ApiProperty } from '@nestjs/swagger'

export class SaveProgressDto {
	@ApiProperty({ example: 'a3f1c2e4-...' })
	movieId!: string

	@ApiProperty({ example: 309, description: 'Video qayerda to\'xtaganini bildiruvchi soniya (YouTube\'dagi &t=309s kabi)' })
	positionSeconds!: number
}
