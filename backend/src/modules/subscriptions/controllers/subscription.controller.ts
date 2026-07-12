import { Controller, Get, Post, Body, Req, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SubscriptionService } from '../services/subscription.service'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { createSubscriptionSchema } from '../schemas/create-subscription.schema'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'

@ApiTags('Subscriptions')
@Controller('subscriptions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
	constructor(private readonly subscriptionService: SubscriptionService) { }

	@Post()
	@ApiOperation({ summary: 'Subscribe to a plan' })
	async subscribe(@Req() req: any, @Body() dto: CreateSubscriptionDto) {
		const parsed = createSubscriptionSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.subscriptionService.subscribe(req.user.id, parsed.data)
	}

	@Get('me')
	@ApiOperation({ summary: 'Get my current subscription status' })
	async getStatus(@Req() req: any) {
		return this.subscriptionService.getStatus(req.user.id)
	}

	@Post('cancel')
	@ApiOperation({ summary: 'Cancel active subscription' })
	async cancel(@Req() req: any) {
		return this.subscriptionService.cancel(req.user.id)
	}

	@Get('history')
	@ApiOperation({ summary: 'Subscription history' })
	async history(@Req() req: any) {
		return this.subscriptionService.history(req.user.id)
	}
}
