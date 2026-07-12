import { BadRequestException, Injectable } from '@nestjs/common'
import { SubscriptionRepository } from '../repositories/subscription.repository'
import { CreateSubscriptionInput } from '../schemas/create-subscription.schema'
import { SubscriptionErrorMessages } from 'src/config/errors'

const PLAN_DURATIONS_DAYS: Record<string, number> = {
	monthly: 30,
}

@Injectable()
export class SubscriptionService {
	constructor(private readonly subscriptionRepository: SubscriptionRepository) { }

	async subscribe(userId: string, dto: CreateSubscriptionInput) {
		const active = await this.subscriptionRepository.findActiveByUserId(userId)

		if (active) {
			throw new BadRequestException(SubscriptionErrorMessages.ALREADY_SUBSCRIBED)
		}

		const durationDays = PLAN_DURATIONS_DAYS[dto.plan]
		const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

		const subscription = await this.subscriptionRepository.create(userId, dto.plan, expiresAt)

		// ESLATMA: bu yerga BullMQ delayed job qo'shiladi:
		//   - expiresAt - 1 kun: "obunangiz ertaga tugaydi" eslatmasi
		//   - expiresAt: statusni "expired" ga o'tkazish + xabar
		// Hozircha faqat status va expires_at DB'da saqlanadi, worker keyingi bosqichda qo'shiladi.

		return { success: true, subscription }
	}

	async getStatus(userId: string) {
		const active = await this.subscriptionRepository.findActiveByUserId(userId)
		return {
			success: true,
			isActive: !!active,
			subscription: active ?? null,
		}
	}

	async cancel(userId: string) {
		const cancelled = await this.subscriptionRepository.cancel(userId)

		if (!cancelled) {
			throw new BadRequestException(SubscriptionErrorMessages.NO_ACTIVE_SUBSCRIPTION)
		}

		return { success: true, subscription: cancelled }
	}

	async history(userId: string) {
		const items = await this.subscriptionRepository.findAllByUserId(userId)
		return { success: true, items }
	}
}
