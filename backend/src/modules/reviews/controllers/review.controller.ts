import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ReviewService } from '../services/review.service'
import { CreateReviewDto } from '../dto/create-review.dto'
import { createReviewSchema } from '../schemas/create-review.schema'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'
import { AdminGuard } from 'src/common/guards/admin.guard'

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) { }

	@Post()
	@ApiOperation({ summary: 'Create a review for a movie' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard)
	async create(@Req() req: any, @Body() dto: CreateReviewDto) {
		const parsed = createReviewSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.reviewService.create(req.user.id, parsed.data)
	}

	@Get('movie/:movieId')
	@ApiOperation({ summary: 'List reviews for a movie (public, pinned + VIP first)' })
	async findByMovie(@Param('movieId') movieId: string) {
		return this.reviewService.findByMovie(movieId)
	}

	@Patch(':id/pin')
	@ApiOperation({ summary: '[Admin] Pin a review' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard, AdminGuard)
	async pin(@Param('id') id: string) {
		return this.reviewService.setPinned(id, true)
	}

	@Patch(':id/unpin')
	@ApiOperation({ summary: '[Admin] Unpin a review' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard, AdminGuard)
	async unpin(@Param('id') id: string) {
		return this.reviewService.setPinned(id, false)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a review (owner or admin)' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard)
	async delete(@Req() req: any, @Param('id') id: string) {
		return this.reviewService.delete(id, req.user.id, !!req.user.isAdmin)
	}
}
