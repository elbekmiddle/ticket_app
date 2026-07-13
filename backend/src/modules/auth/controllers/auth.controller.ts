import { Controller, Post, Body, BadRequestException, Get, UseGuards, Req } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

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
import { ResendOtpDto } from 'src/modules/auth/dto/resend-otp.dto'
import { resendOtpSchema } from 'src/modules/auth/schemas/resend-otp.schema'
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto'
import { refreshTokenSchema } from 'src/modules/auth/schemas/refresh-token.schema'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Throttle({ default: { limit: 5, ttl: 60_000 } })
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

	@Throttle({ default: { limit: 5, ttl: 60_000 } })
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

	@Throttle({ default: { limit: 5, ttl: 60_000 } })
	@Post('verify-email')
	@ApiOperation({ summary: 'Verify email with OTP' })
	async verifyEmail(@Body() dto: VerifyEmailDto) {
		const parse = verifyEmailSchema.safeParse(dto)
		if (!parse.success) {
			throw new BadRequestException(parse.error.issues[0].message)
		}
		return this.authService.verifyEmail(parse.data)
	}

	@Throttle({ default: { limit: 3, ttl: 60_000 } })
	@Post('resend-otp')
	@ApiOperation({ summary: 'Resend verification OTP (agar birinchi email kelmagan bo\'lsa)' })
	async resendOtp(@Body() dto: ResendOtpDto) {
		const parse = resendOtpSchema.safeParse(dto)
		if (!parse.success) {
			throw new BadRequestException(parse.error.issues[0].message)
		}
		return this.authService.resendOtp(parse.data)
	}

	@Post('refresh')
	@ApiOperation({ summary: 'Get new access+refresh tokens using a valid refresh token' })
	async refresh(@Body() dto: RefreshTokenDto) {
		const parse = refreshTokenSchema.safeParse(dto)
		if (!parse.success) {
			throw new BadRequestException(parse.error.issues[0].message)
		}
		return this.authService.refresh(parse.data)
	}

	@Throttle({ default: { limit: 3, ttl: 60_000 } })
	@Post('forgot-password')
	@ApiOperation({ summary: 'Send reset password OTP' })
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		const parse = forgotPasswordSchema.safeParse(dto)
		if (!parse.success) {
			throw new BadRequestException(parse.error.issues[0].message)
		}
		return this.authService.forgotPassword(parse.data)
	}

	@Throttle({ default: { limit: 5, ttl: 60_000 } })
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
	@UseGuards(JwtAuthGuard)
	async getProfile(@Req() req: any) {
		const user = await this.authService.getProfile(req.user.id)
		return { success: true, user }
	}
}
