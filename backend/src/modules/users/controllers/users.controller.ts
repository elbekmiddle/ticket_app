import { Controller, Get, Patch, Delete, Param, Body, Req, Query, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from '../services/users.service'
import { UpdateProfileDto } from '../dto/update-profile.dto'
import { updateProfileSchema } from '../schemas/update-profile.schema'
import { UpdateTierDto } from '../dto/update-tier.dto'
import { updateTierSchema } from '../schemas/update-tier.schema'
import { listUsersSchema } from '../schemas/list-users.schema'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'
import { AdminGuard } from 'src/common/guards/admin.guard'

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get('me')
	@ApiOperation({ summary: 'My profile (tier, isAdmin bilan)' })
	async getMe(@Req() req: any) {
		return this.usersService.getMe(req.user.id)
	}

	@Patch('me')
	@ApiOperation({ summary: 'Update my profile (name)' })
	async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
		const parsed = updateProfileSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.usersService.updateMe(req.user.id, parsed.data)
	}

	@Get()
	@ApiOperation({ summary: '[Admin] List all users' })
	@UseGuards(AdminGuard)
	async list(@Query() query: Record<string, string>) {
		const parsed = listUsersSchema.safeParse(query)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.usersService.list(parsed.data)
	}

	@Get(':id')
	@ApiOperation({ summary: '[Admin] Get user by id' })
	@UseGuards(AdminGuard)
	async findById(@Param('id') id: string) {
		return this.usersService.findById(id)
	}

	@Patch(':id/tier')
	@ApiOperation({ summary: '[Admin] Set user tier (1/2/3 — VIP tayinlash uchun)' })
	@UseGuards(AdminGuard)
	async updateTier(@Param('id') id: string, @Body() dto: UpdateTierDto) {
		const parsed = updateTierSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.usersService.updateTier(id, parsed.data)
	}

	@Delete(':id')
	@ApiOperation({ summary: '[Admin] Soft-delete a user (data saqlanadi, faqat login qila olmaydi)' })
	@UseGuards(AdminGuard)
	async remove(@Req() req: any, @Param('id') id: string) {
		return this.usersService.remove(id, req.user.id)
	}
}
