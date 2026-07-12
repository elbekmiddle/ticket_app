import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MediaService } from '../services/media.service'
import { UploadUrlDto } from '../dto/upload-url.dto'
import { uploadUrlSchema } from '../schemas/upload-url.schema'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'
import { AdminGuard } from 'src/common/guards/admin.guard'

@ApiTags('Media (Admin)')
@Controller('admin/media')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MediaController {
	constructor(private readonly mediaService: MediaService) { }

	@Post('upload-url')
	@ApiOperation({
		summary: 'Generate S3 presigned upload URL for a video file',
		description: 'Admin panel bu URL\'ga browser\'dan to\'g\'ridan-to\'g\'ri PUT qiladi. Keyin qaytgan cdnUrl\'ni movie.videoUrl sifatida saqlang.',
	})
	async getUploadUrl(@Body() dto: UploadUrlDto) {
		const parsed = uploadUrlSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.mediaService.getUploadUrl(parsed.data)
	}
}
