import { ApiProperty } from '@nestjs/swagger'

export class CreateSubscriptionDto {
	@ApiProperty({ example: 'monthly', enum: ['monthly'], description: 'Hozircha faqat oylik reja' })
	plan!: string
}
