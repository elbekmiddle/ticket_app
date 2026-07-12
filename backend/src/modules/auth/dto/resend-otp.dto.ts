import { ApiProperty } from '@nestjs/swagger'

export class ResendOtpDto {
	@ApiProperty({ example: 'user@mail.com' })
	email!: string
}
