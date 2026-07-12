import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthCryptoService } from 'src/modules/auth/services/auth-crypto.service'
import { TokenService } from 'src/modules/auth/services/token.service'
import { RegisterDto } from "../dto/register.dto"
import { AuthErrorMessages } from 'src/config/errors'
import { LoginDto } from 'src/modules/auth/dto/login.dto'
import { RedisService } from 'src/redis/redis.service'
import { OtpService } from 'src/modules/auth/services/otp.service'
import { EmailService } from 'src/modules/auth/services/email.service'
import { VerifyEmailDto } from 'src/modules/auth/dto/verify-email.dto'
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto'
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto'
import { UserRepository } from '../repositories/user.repository'

@Injectable()
export class AuthService {
	constructor(
		private readonly cryptoService: AuthCryptoService,
		private readonly tokenService: TokenService,
		private readonly otpService: OtpService,
		private readonly emailService: EmailService,
		private readonly redisService: RedisService,
		private readonly userRepository: UserRepository,
	) {}

	async register(dto: RegisterDto) {
		const existingUsers = await this.userRepository.findByEmail(dto.email)

		if (existingUsers) {
			throw new ConflictException(
				AuthErrorMessages.EMAIL_ALREADY_EXISTS,
			)
		}

		const hashedPassword = await this.cryptoService.hashPassword(dto.password)

		const user = await this.userRepository.createUser(
			dto.name,
			dto.email,
			hashedPassword,
		)

		const otpPromise = this.otpService.sendVerificationOtp(user.id, user.email)
		const verificationTokenPromise =
			this.tokenService.generateVerificationToken(user.id)

		const [otp, verificationToken] = await Promise.all([
			otpPromise,
			verificationTokenPromise,
		])

		void this.emailService.sendVerificationEmail(
			user.email,
			user.name,
			otp,
		).catch(console.error)

		return {
			success: true,
			message: "Verification code sent to email",
			verificationToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				isVerified: user.is_verified,
			},
		}
	}

	async login(dto: LoginDto) {
		const user = await this.userRepository.findByEmailWithPassword(dto.email)

		if (!user) {
			throw new UnauthorizedException(
				AuthErrorMessages.INVALID_CREDENTIALS,
			)
		}

		if (!user.is_verified) {
			throw new UnauthorizedException(
				AuthErrorMessages.EMAIL_NOT_VERIFIED,
			)
		}

		const isPasswordMatch = await this.cryptoService.comparePassword(
			dto.password,
			user.password,
		)

		if (!isPasswordMatch) {
			throw new UnauthorizedException(
				AuthErrorMessages.INVALID_CREDENTIALS,
			)
		}

		const tokens = await this.tokenService.generateTokens({
			userId: user.id,
		})

		return {
			success: true,
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		}
	}

	async verifyEmail(dto: VerifyEmailDto) {
		const payload = await this.tokenService.verifyVerificationToken(
			dto.verificationToken,
		)

		const userId = payload.userId

		await this.otpService.verifyOtp(userId, dto.otp)

		await this.userRepository.verifyUser(userId)

		await this.otpService.deleteOtp(userId)

		const tokens = await this.tokenService.generateTokens({
			userId,
		})

		// const user = await this.userRepository.findByEmailWithPassword("") 
		const user = await this.userRepository.findById(userId)

		return {
			success: true,
			...tokens,
			user,
		}
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const user = await this.userRepository.findByEmail(dto.email)

		if (!user) {
			return {
				success: true,
				message: AuthErrorMessages.If_email_exists_OTP_sent,
			}
		}

		const otp = await this.otpService.sendVerificationOtp(
			user.id,
			user.email,
		)

		await this.emailService.sendPasswordResetEmail(
			user.email,
			user.name,
			otp,
		).catch(console.error)

		return {
			success: true,
			message: AuthErrorMessages.If_email_exists_OTP_sent,
		}
	}

	async resetPassword(dto: ResetPasswordDto) {
		const user = await this.userRepository.findByEmail(dto.email)

		if (!user) {
			throw new UnauthorizedException(
				AuthErrorMessages.INVALID_REQUEST,
			)
		}

		await this.otpService.verifyOtp(user.id, dto.otp)

		const hashedPassword = await this.cryptoService.hashPassword(
			dto.newPassword,
		)

		await this.userRepository.updatePassword(user.id, hashedPassword)

		await this.otpService.deleteOtp(user.id)

		return {
			success: true,
			message: "Password updated successfully",
		}
	}
}

export class AuthModule { }