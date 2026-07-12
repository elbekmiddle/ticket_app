import { Module } from '@nestjs/common'
import { SubscriptionController } from './controllers/subscription.controller'
import { SubscriptionService } from './services/subscription.service'
import { SubscriptionRepository } from './repositories/subscription.repository'

@Module({
	controllers: [SubscriptionController],
	providers: [SubscriptionService, SubscriptionRepository],
	exports: [SubscriptionRepository],
})
export class SubscriptionsModule { }
