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
import { ForgotPasswordDto } from 'src/modules/auth/dto/ForgotPassword.dto'
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto'
import { Pool } from 'pg'

@Injectable()
export class AuthService {
	constructor(
		@Inject("DATABASE_POOL")
		private readonly db: Pool,
		private readonly cryptoService: AuthCryptoService,
		private readonly tokenService: TokenService,
		private readonly otpService: OtpService,
		private readonly emailService: EmailService,
		private readonly redisService: RedisService,
	) { }

	async register(dto: RegisterDto) {
		const { rows: existingUsers } = await this.db.query(
			`SELECT id FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)

		if (existingUsers.length > 0) {
			throw new ConflictException(
				AuthErrorMessages.EMAIL_ALREADY_EXISTS,
			)
		}
		const hashedPassword =
			await this.cryptoService.hashPassword(dto.password)



		const { rows } = await this.db.query(
			`
      INSERT INTO users
      (
        name,
        email,
        password,
        is_verified,
        created_at,
        updated_at
      )
      VALUES
      ($1, $2, $3, false, NOW(), NOW())
      RETURNING id, name, email, is_verified
    `,
			[dto.name, dto.email, hashedPassword],
		)
		const user = rows[0]

		const otpPromise = this.otpService.sendVerificationOtp(user.id, user.email)

		const verificationTokenPromise = this.tokenService.generateVerificationToken(user.id)



		const [otp, verificationToken] = await Promise.all([otpPromise, verificationTokenPromise])
		void this.emailService.sendVerificationEmail(
			user.email,
			user.name,
			otp,
		).catch((err) => {
			console.error("Email send failed:", err)
		})
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

		const { rows } = await this.db.query(
			`
  SELECT
      id,
      name,
      email,
      password,
      is_verified
  FROM users
  WHERE email = $1
  LIMIT 1
`,
			[dto.email],
		)


		const user = rows[0]


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

		const isPasswordMatch =
			await this.cryptoService.comparePassword(
				dto.password,
				user.password,
			)

		if (!isPasswordMatch) {
			throw new UnauthorizedException(
				AuthErrorMessages.INVALID_CREDENTIALS,
			)
		}

		const tokens =
			await this.tokenService.generateTokens({
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

		const payload =
			await this.tokenService.verifyVerificationToken(
				dto.verificationToken,
			)

		const userId = payload.userId

		await this.otpService.verifyOtp(
			userId,
			dto.otp,
		)

		await this.db.query(
			`
    UPDATE users
    SET is_verified = true,
      updated_at = NOW(),
			verified_at = NOW()
    WHERE id = $1
    `,
			[userId],
		)

		await this.otpService.deleteOtp(userId)

		const tokens =
			await this.tokenService.generateTokens({
				userId,
			})

		const { rows } = await this.db.query(
			`
    SELECT id,name,email
    FROM users
    WHERE id=$1
    `,
			[userId],
		)

		return {
			success: true,
			...tokens,
			user: rows[0],
		}
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const { rows } = await this.db.query(
			`SELECT id, email, name FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)

		const user = rows[0]

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
		const { rows } = await this.db.query(
			`SELECT id FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)

		const user = rows[0]

		if (!user) {
			throw new UnauthorizedException(
				AuthErrorMessages.INVALID_REQUEST,
			)
		}

		await this.otpService.verifyOtp(user.id, dto.otp)

		const hashedPassword =
			await this.cryptoService.hashPassword(dto.newPassword)

		await this.db.query(
			`
    UPDATE users
    SET password = $1,
        updated_at = NOW()
    WHERE id = $2
    `,
			[hashedPassword, user.id],
		)

		// cleanup OTP
		await this.otpService.deleteOtp(user.id)

		return {
			success: true,
			message: "Password updated successfully",
		}
	}
}

export class AuthModule { }