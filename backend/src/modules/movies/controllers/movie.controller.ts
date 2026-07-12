import { Controller, Get, Post, Patch, Delete, Body, Param, Query, BadRequestException, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MovieService } from '../services/movie.service'
import { CreateMovieDto } from '../dto/create-movie.dto'
import { UpdateMovieDto } from '../dto/update-movie.dto'
import { createMovieSchema } from '../schemas/create-movie.schema'
import { updateMovieSchema } from '../schemas/update-movie.schema'
import { listMoviesSchema } from '../schemas/list-movies.schema'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'

// Eslatma: hozircha har qanday login qilgan foydalanuvchi kino qo'sha oladi.
// Production'da bu yerga RolesGuard (faqat admin) qo'shish kerak bo'ladi —
// hozirgi bosqichda role/permission tizimi hali yo'q.

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
	constructor(private readonly movieService: MovieService) { }

	@Post()
	@ApiOperation({ summary: 'Create movie (admin)' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard)
	async create(@Body() dto: CreateMovieDto) {
		const parsed = createMovieSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.movieService.create(parsed.data)
	}

	@Get()
	@ApiOperation({ summary: 'List movies (public)' })
	async findMany(@Query() query: Record<string, string>) {
		const parsed = listMoviesSchema.safeParse(query)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.movieService.findMany(parsed.data)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get movie by id (public)' })
	async findById(@Param('id') id: string) {
		return this.movieService.findById(id)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update movie (admin)' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard)
	async update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
		const parsed = updateMovieSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.movieService.update(id, parsed.data)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete movie (admin)' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard)
	async delete(@Param('id') id: string) {
		return this.movieService.delete(id)
	}
}
