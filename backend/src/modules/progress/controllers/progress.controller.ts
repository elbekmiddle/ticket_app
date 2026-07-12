import { Controller, Post, Get, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ProgressService } from '../services/progress.service'
import { SaveProgressDto } from '../dto/save-progress.dto'
import { saveProgressSchema } from '../schemas/save-progress.schema'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'

@ApiTags('Progress')
@Controller('progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ProgressController {
	constructor(private readonly progressService: ProgressService) { }

	@Post()
	@ApiOperation({ summary: 'Save current video position (frontend har 5-10s chaqiradi)' })
	async save(@Req() req: any, @Body() dto: SaveProgressDto) {
		const parsed = saveProgressSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.progressService.save(req.user.id, parsed.data)
	}

	@Get(':movieId')
	@ApiOperation({ summary: 'Get last watched position for resume' })
	async get(@Req() req: any, @Param('movieId') movieId: string) {
		return this.progressService.get(req.user.id, movieId)
	}
}
