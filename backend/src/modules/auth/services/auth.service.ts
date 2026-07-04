import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'src/modules/auth/entities/user.entity'
import { AuthCryptoService } from 'src/modules/auth/services/auth-crypto.service'
import { TokenService } from 'src/modules/auth/services/token.service'
import { DataSource, Repository } from 'typeorm'
import {RegisterDto} from "../dto/register.dto"
import { AuthErrorMessages } from 'src/config/errors'
import { email } from 'zod'
import { LoginDto } from 'src/modules/auth/dto/login.dto'
import { RedisService } from 'src/redis/redis.service'
import { OtpService } from 'src/modules/auth/services/otp.service'
import { EmailService } from 'src/modules/auth/services/email.service'

@Injectable()
export class AuthService {
	constructor(
		@Inject('DATA_SOURCE')
		private readonly dataSource: DataSource,
		private readonly cryptoService: AuthCryptoService,
		private readonly tokenService: TokenService,
		private readonly otpService: OtpService,
		private readonly emailService: EmailService,
	) { }

	async register(dto: RegisterDto) {
		// 1. Check existing user
		const existingUser = await this.dataSource.query(
			`SELECT id FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)

		if (existingUser.length > 0) {
			throw new ConflictException(
				AuthErrorMessages.EMAIL_ALREADY_EXISTS,
			)
		}

		// 2. Hash password
		const hashedPassword =
			await this.cryptoService.hashPassword(dto.password)

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

		const user = result[0]

		const verificationToken =
			await this.tokenService.generateVerificationToken(user.id)

		
		const otp = await this.otpService.sendVerificationOtp(
			user.id,
			user.email,
		)

		// 6. Send email
		await this.emailService.sendVerificationEmail(
			user.email,
			user.name,
			otp,
		)

		// 7. Response
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
}

export class AuthModule {}