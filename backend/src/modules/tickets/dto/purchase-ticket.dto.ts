import { ApiProperty } from '@nestjs/swagger'

export class PurchaseTicketDto {
	@ApiProperty({ example: 'a3f1c2e4-...' })
	movieId!: string
}
