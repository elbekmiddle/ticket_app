import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { AuthCryptoService } from 'src/modules/auth/services/auth-crypto.service'
import { TokenService } from 'src/modules/auth/services/token.service'
import { RegisterDto } from '../dto/register.dto'
import { AuthErrorMessages } from 'src/config/errors'
import { LoginDto } from 'src/modules/auth/dto/login.dto'
import { OtpService } from 'src/modules/auth/services/otp.service'
import { EmailService } from 'src/modules/auth/services/email.service'
import { VerifyEmailDto } from 'src/modules/auth/dto/verify-email.dto'
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto'
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto'
import { ResendOtpDto } from 'src/modules/auth/dto/resend-otp.dto'
import { UserRepository } from '../repositories/user.repository'
import { withTimeout } from 'src/common/with-timeout'

// Email provayder (Resend) sekinlashsa ham, register/forgot-password/resend-otp
// endpointlari bundan ortiq osilib qolmaydi — shundan keyin "emailSent: false"
// deb javob qaytariladi, lekin OTP baribir Redis'da saqlangan bo'ladi.
const EMAIL_SEND_TIMEOUT_MS = 5000

@Injectable()
export class AuthService {
	constructor(
		private readonly cryptoService: AuthCryptoService,
		private readonly tokenService: TokenService,
		private readonly otpService: OtpService,
		private readonly emailService: EmailService,
		private readonly userRepository: UserRepository,
	) { }

	async register(dto: RegisterDto) {
		const existingUsers = await this.userRepository.findByEmail(dto.email)

		if (existingUsers) {
			throw new ConflictException(AuthErrorMessages.EMAIL_ALREADY_EXISTS)
		}

		const hashedPassword = await this.cryptoService.hashPassword(dto.password)

		const user = await this.userRepository.createUser(dto.name, dto.email, hashedPassword)

		const [otp, verificationToken] = await Promise.all([
			this.otpService.sendVerificationOtp(user.id, user.email),
			this.tokenService.generateVerificationToken(user.id),
		])

		// Endi bu chaqiruv AWAIT qilinadi (fire-and-forget emas), lekin
		// timeout bilan chegaralangan — shuning uchun response osilib qolmaydi,
		// ammo email haqiqatan yuborilgan-yuborilmaganini frontend'ga aytib bera olamiz.
		const emailSent = await withTimeout(
			this.emailService.sendVerificationEmail(user.email, user.name, otp),
			EMAIL_SEND_TIMEOUT_MS,
			false,
		)

		return {
			success: true,
			message: emailSent
				? 'Verification code sent to email'
				: 'Account created, lekin email yuborishda muammo bo\'ldi — "Qayta yuborish" tugmasidan foydalaning',
			emailSent,
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
			throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS)
		}

		if (!user.is_verified) {
			throw new UnauthorizedException(AuthErrorMessages.EMAIL_NOT_VERIFIED)
		}

		const isPasswordMatch = await this.cryptoService.comparePassword(dto.password, user.password)

		if (!isPasswordMatch) {
			throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS)
		}

		const tokens = await this.tokenService.generateTokens({ userId: user.id })

		return {
			success: true,
			...tokens,
			user: { id: user.id, name: user.name, email: user.email },
		}
	}

	async verifyEmail(dto: VerifyEmailDto) {
		const payload = await this.tokenService.verifyVerificationToken(dto.verificationToken)
		const userId = payload.userId

		await this.otpService.verifyOtp(userId, dto.otp)
		await this.userRepository.verifyUser(userId)
		await this.otpService.deleteOtp(userId)

		const tokens = await this.tokenService.generateTokens({ userId })
		const user = await this.userRepository.findById(userId)

		return { success: true, ...tokens, user }
	}

	// Register vaqtida email yetib bormasa (yoki OTP 10 daqiqada muddati o'tsa),
	// foydalanuvchi shu endpoint orqali yangi OTP + verification token so'rashi mumkin.
	async resendOtp(dto: ResendOtpDto) {
		const user = await this.userRepository.findByEmail(dto.email)

		if (!user) {
			throw new NotFoundException(AuthErrorMessages.USER_NOT_FOUND)
		}

		if (user.is_verified) {
			return {
				success: true,
				alreadyVerified: true,
				message: 'Email allaqachon tasdiqlangan, login qilishingiz mumkin',
			}
		}

		const [otp, verificationToken] = await Promise.all([
			this.otpService.sendVerificationOtp(user.id, user.email),
			this.tokenService.generateVerificationToken(user.id),
		])

		const emailSent = await withTimeout(
			this.emailService.sendVerificationEmail(user.email, user.name, otp),
			EMAIL_SEND_TIMEOUT_MS,
			false,
		)

		return {
			success: true,
			emailSent,
			verificationToken,
			message: emailSent
				? 'Yangi tasdiqlash kodi yuborildi'
				: 'Kod generatsiya qilindi, lekin email yuborishda muammo bo\'ldi — birozdan so\'ng qayta urinib ko\'ring',
		}
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const user = await this.userRepository.findByEmail(dto.email)

		// Doim bir xil javob — user enumeration'dan himoya.
		// `emailSent: false` bu yerda ham, pastdagi haqiqiy xato holatida ham chiqishi
		// mumkin — shuning uchun bu maydon "email mavjudmi"ni oshkor qilmaydi.
		if (!user) {
			return {
				success: true,
				emailSent: false,
				message: AuthErrorMessages.If_email_exists_OTP_sent,
			}
		}

		const otp = await this.otpService.sendVerificationOtp(user.id, user.email)

		const emailSent = await withTimeout(
			this.emailService.sendPasswordResetEmail(user.email, user.name, otp),
			EMAIL_SEND_TIMEOUT_MS,
			false,
		)

		return {
			success: true,
			emailSent,
			message: AuthErrorMessages.If_email_exists_OTP_sent,
		}
	}

	async resetPassword(dto: ResetPasswordDto) {
		const user = await this.userRepository.findByEmail(dto.email)

		if (!user) {
			throw new UnauthorizedException(AuthErrorMessages.INVALID_REQUEST)
		}

		await this.otpService.verifyOtp(user.id, dto.otp)

		const hashedPassword = await this.cryptoService.hashPassword(dto.newPassword)
		await this.userRepository.updatePassword(user.id, hashedPassword)
		await this.otpService.deleteOtp(user.id)

		return { success: true, message: 'Password updated successfully' }
	}
	async getProfile(userId: string) {
		return this.userRepository.findById(userId)
	}
}
