import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordDto {

	@ApiProperty({
		example: 'user@mail.com',
	})
	email!: string


	@ApiProperty({
		example: '123456',
	})
	otp!: string


	@ApiProperty({
		example: 'newPassword123',
	})
	newPassword!: string
}