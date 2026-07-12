import { ApiProperty } from '@nestjs/swagger'

export class UpdateProfileDto {
	@ApiProperty({ example: 'Elbek', required: false })
	name?: string
}
