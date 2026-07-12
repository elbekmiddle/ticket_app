import { ApiProperty } from '@nestjs/swagger'

export class ListUsersDto {
	@ApiProperty({ required: false, example: 1 })
	page?: number

	@ApiProperty({ required: false, example: 20 })
	limit?: number
}
