import { ApiProperty } from '@nestjs/swagger'

export class VerifyEmailDto {
	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1Ni...',
	})
	verificationToken!: string


	@ApiProperty({
		example: '123456',
	})
	otp!: string
}