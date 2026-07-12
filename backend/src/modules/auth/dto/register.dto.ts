import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
	@ApiProperty({ example: 'Elbek', description: 'User name' })
	name!: string

	@ApiProperty({ example: 'user@mail.com', description: 'User email' })
	email!: string

	@ApiProperty({ example: 'password123', description: 'User password' })
	password!: string
}
