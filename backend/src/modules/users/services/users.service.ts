import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from 'src/modules/auth/repositories/user.repository'
import { UpdateProfileInput } from '../schemas/update-profile.schema'
import { UpdateTierInput } from '../schemas/update-tier.schema'
import { ListUsersInput } from '../schemas/list-users.schema'

// Tier nomlari — reviews va boshqa joylarda badge sifatida ko'rsatiladi
export const TIER_LABELS: Record<number, string> = {
	1: 'Yangi foydalanuvchi',
	2: 'Sodiq mijoz',
	3: 'VIP',
}

@Injectable()
export class UsersService {
	constructor(private readonly userRepository: UserRepository) { }

	async getMe(userId: string) {
		const user = await this.userRepository.findById(userId)

		if (!user) {
			throw new NotFoundException('USER_NOT_FOUND')
		}

		return {
			success: true,
			user: { ...user, tierLabel: TIER_LABELS[user.tier] ?? TIER_LABELS[1] },
		}
	}

	async updateMe(userId: string, dto: UpdateProfileInput) {
		if (!dto.name) {
			throw new BadRequestException('NOTHING_TO_UPDATE')
		}

		const user = await this.userRepository.updateName(userId, dto.name)
		return { success: true, user }
	}

	// ---- Admin-only ----

	async list(filters: ListUsersInput) {
		const result = await this.userRepository.findMany(filters.page, filters.limit)
		return { success: true, ...result }
	}

	async findById(id: string) {
		const user = await this.userRepository.findById(id)

		if (!user) {
			throw new NotFoundException('USER_NOT_FOUND')
		}

		return { success: true, user }
	}

	// Admin VIP (tier=3) beradi yoki tierni qo'lda tuzatadi.
	// Tier=2'ga avtomatik o'tish esa ticket.service.ts'da (3 premyera chipta sotib olingach) sodir bo'ladi.
	async updateTier(id: string, dto: UpdateTierInput) {
		const existing = await this.userRepository.findById(id)

		if (!existing) {
			throw new NotFoundException('USER_NOT_FOUND')
		}

		const user = await this.userRepository.updateTier(id, dto.tier)
		return { success: true, user }
	}

	// Soft-delete — user login qila olmay qoladi, lekin ma'lumot (tickets, reviews,
	// subscriptions tarixi) bazada saqlanib qoladi.
	async remove(id: string, requesterId: string) {
		if (id === requesterId) {
			throw new BadRequestException('CANNOT_DELETE_YOURSELF')
		}

		const existing = await this.userRepository.findById(id)

		if (!existing) {
			throw new NotFoundException('USER_NOT_FOUND')
		}

		await this.userRepository.softDelete(id)
		return { success: true, message: 'User deleted' }
	}
}
