import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthCryptoService } from 'src/modules/auth/services/auth-crypto.service'
import { TokenService } from 'src/modules/auth/services/token.service'
import { DataSource, Repository } from 'typeorm'
import {RegisterDto} from "../dto/register.dto"
import { AuthErrorMessages } from 'src/config/errors'
import { email, success } from 'zod'
import { LoginDto } from 'src/modules/auth/dto/login.dto'
import { RedisService } from 'src/redis/redis.service'
import { OtpService } from 'src/modules/auth/services/otp.service'
import { EmailService } from 'src/modules/auth/services/email.service'
import { VerifyEmailDto } from 'src/modules/auth/dto/verify-email.dto'
import { ForgotPasswordDto } from 'src/modules/auth/dto/ForgotPassword.dto'
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto'

@Injectable()
export class AuthService {
	constructor(
		@Inject('DATA_SOURCE')
		private readonly dataSource: DataSource,
		private readonly cryptoService: AuthCryptoService,
		private readonly tokenService: TokenService,
		private readonly otpService: OtpService,
		private readonly emailService: EmailService,
		private readonly redisService: RedisService,
	) { }

	async register(dto: RegisterDto) {
		console.time("register");
		const existingUser = await this.dataSource.query(
			`SELECT id FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)
		console.time("check-user");

		if (existingUser.length > 0) {
			throw new ConflictException(
				AuthErrorMessages.EMAIL_ALREADY_EXISTS,
			)
		}
		console.timeEnd("check-user");
		console.time("hash");
		// 2. Hash password
		const hashedPassword =
			await this.cryptoService.hashPassword(dto.password)
		console.timeEnd("hash");

		
		
		console.time("insert");
		// 3. Create user
		const result = await this.dataSource.query(
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
		console.timeEnd("insert");
		const user = result[0]
		console.time("jwt");

			const otpPromise = this.otpService.sendVerificationOtp(user.id, user.email)

			const verificationTokenPromise = this.tokenService.generateVerificationToken(user.id)
			
			
			
			console.timeEnd("jwt");
			console.time("otp");
			// const otp = await this.otpService.sendVerificationOtp(
			// 	user.id,
			// 	user.email,
			// )
			const [otp, verificationToken] = await Promise.all([otpPromise, verificationTokenPromise])	
			console.timeEnd("otp");

		// 6. Send email
		console.time("email");
		 void this.emailService.sendVerificationEmail(
			user.email,
			user.name,
			otp,
		 ).catch((err) => {
			 console.error("Email send failed:", err)
		 });
		console.timeEnd("email");

		console.timeEnd("register");
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
		console.time('login-total')

		console.time('db')
		
		const result = await this.dataSource.query(
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
		);

		console.timeEnd('db')

		const user = result[0]


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

		console.time('verify')
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
		console.timeEnd('verify')

		console.time('jwt')
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
		};
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

		await this.dataSource.query(
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

		const result = await this.dataSource.query(
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
			user: result[0],
		}
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const result = await this.dataSource.query(
			`SELECT id, email, name FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)

		const user = result[0]

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
		const result = await this.dataSource.query(
			`SELECT id FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)

		const user = result[0]

		if (!user) {
			throw new UnauthorizedException(
				AuthErrorMessages.INVALID_REQUEST,
			)
		}

		await this.otpService.verifyOtp(user.id, dto.otp)

		const hashedPassword =
			await this.cryptoService.hashPassword(dto.newPassword)

		await this.dataSource.query(
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

export class AuthModule {}