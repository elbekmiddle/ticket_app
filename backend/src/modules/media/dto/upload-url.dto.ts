import { ApiProperty } from '@nestjs/swagger'

export class UploadUrlDto {
	@ApiProperty({ example: 'interstellar-master.mp4' })
	fileName!: string

	@ApiProperty({ example: 'video/mp4' })
	contentType!: string
}
