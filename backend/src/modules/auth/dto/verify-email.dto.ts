import { ApiProperty } from '@nestjs/swagger'

export class VerifyEmailDto {
	@ApiProperty()
	verificationToken!: string

	@ApiProperty({ example: '123456' })
	otp!: string
}
