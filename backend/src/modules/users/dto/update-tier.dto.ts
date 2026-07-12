import { ApiProperty } from '@nestjs/swagger'

export class UpdateTierDto {
	@ApiProperty({ example: 3, enum: [1, 2, 3], description: '1=oddiy, 2=sodiq mijoz, 3=VIP' })
	tier!: number
}
