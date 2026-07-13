import { ApiProperty } from '@nestjs/swagger'

export class UploadUrlDto {
	@ApiProperty({ example: 'video', enum: ['video', 'poster'], description: 'Fayl turi — S3 papkasi va ruxsat etilgan content-type shunga qarab belgilanadi' })
	type!: 'video' | 'poster'

	@ApiProperty({ example: 'interstellar-master.mp4' })
	fileName!: string

	@ApiProperty({ example: 'video/mp4' })
	contentType!: string
}
