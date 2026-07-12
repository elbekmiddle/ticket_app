import { Controller, Get, Post, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TicketService } from '../services/ticket.service'
import { PurchaseTicketDto } from '../dto/purchase-ticket.dto'
import { purchaseTicketSchema } from '../schemas/purchase-ticket.schema'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'

@ApiTags('Tickets')
@Controller('tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class TicketController {
	constructor(private readonly ticketService: TicketService) { }

	@Post()
	@ApiOperation({ summary: 'Purchase a ticket (permanent access)' })
	async purchase(@Req() req: any, @Body() dto: PurchaseTicketDto) {
		const parsed = purchaseTicketSchema.safeParse(dto)
		if (!parsed.success) {
			throw new BadRequestException(parsed.error.issues[0].message)
		}
		return this.ticketService.purchase(req.user.id, parsed.data)
	}

	@Get('my')
	@ApiOperation({ summary: 'List my purchased tickets' })
	async myTickets(@Req() req: any) {
		return this.ticketService.myTickets(req.user.id)
	}

	@Get('access/:movieId')
	@ApiOperation({ summary: 'Check whether I can watch a movie right now' })
	async checkAccess(@Req() req: any, @Param('movieId') movieId: string) {
		return this.ticketService.checkAccess(req.user.id, movieId)
	}
}
