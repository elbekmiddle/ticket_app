import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenDto {
	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
	refreshToken!: string
}
