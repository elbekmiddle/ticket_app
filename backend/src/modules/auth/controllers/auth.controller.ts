import { Controller, Post, Body, BadRequestException, Get, UseGuards, Req } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger'

import { AuthService } from '../services/auth.service'
import { JwtAuthGuard } from '../guards/jwt.guard'

import { loginSchema } from '../schemas/login.schema'
import { LoginDto } from '../dto/login.dto'
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto'
import { resetPasswordSchema } from 'src/modules/auth/schemas/reset-password.schema'
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto'
import { forgotPasswordSchema } from 'src/modules/auth/schemas/forgot-password.schema'
import { verifyEmailSchema } from 'src/modules/auth/schemas/verify-email.schema'
import { VerifyEmailDto } from 'src/modules/auth/dto/verify-email.dto'
import { registerSchema } from 'src/modules/auth/schemas/register.schema'
import { RegisterDto } from 'src/modules/auth/dto/register.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('register')
	@ApiOperation({ summary: 'Register new user' })
	@ApiResponse({ status: 201, description: 'User registered' })
	async register(@Body() dto: RegisterDto) {
		const parseResult = registerSchema.safeParse(dto)
		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.issues[0].message)
		}
		return this.authService.register(parseResult.data)
	}

	@Post('login')
	@ApiOperation({ summary: 'Login user' })
	@ApiBody({ type: LoginDto })
	async login(@Body() dto: LoginDto) {
		const parseResult = loginSchema.safeParse(dto)
		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.issues[0].message)
		}
		return this.authService.login(parseResult.data)
	}

	@Post('verify-email')
	@ApiOperation({ summary: 'Verify email with OTP' })
	async verifyEmail(@Body() dto: VerifyEmailDto) {
		const parse = verifyEmailSchema.safeParse(dto)
		if (!parse.success) {
			throw new BadRequestException(parse.error.issues[0].message)
		}
		return this.authService.verifyEmail(parse.data)
	}

	@Post('forgot-password')
	@ApiOperation({ summary: 'Send reset password OTP' })
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		const parse = forgotPasswordSchema.safeParse(dto)
		if (!parse.success) {
			throw new BadRequestException(parse.error.issues[0].message)
		}
		return this.authService.forgotPassword(parse.data)
	}

	@Post('reset-password')
	@ApiOperation({ summary: 'Reset password' })
	async resetPassword(@Body() dto: ResetPasswordDto) {
		const parse = resetPasswordSchema.safeParse(dto)
		if (!parse.success) {
			throw new BadRequestException(parse.error.issues[0].message)
		}
		return this.authService.resetPassword(parse.data)
	}

	@Get('me')
	@ApiOperation({ summary: 'Get current user' })
	@ApiBearerAuth('access-token')
	@UseGuards(JwtAuthGuard)
	getProfile(@Req() req: any) {
		return { success: true, user: req.user }
	}
}
