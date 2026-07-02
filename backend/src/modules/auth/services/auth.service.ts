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

@Injectable()
export class AuthService {
	constructor(
		@Inject('DATA_SOURCE')
		private readonly dataSource: DataSource,
		private readonly cryptoService: AuthCryptoService,
		private readonly tokenService: TokenService,
	) { }

	// =========================
	// REGISTER
	// =========================
	async register(dto: RegisterDto) {
		// 1. check existing user (RAW SQL)
		const existingUser = await this.dataSource.query(
			`SELECT id FROM users WHERE email = $1 LIMIT 1`,
			[dto.email],
		)

		if (existingUser.length > 0) {
			throw new ConflictException(AuthErrorMessages.EMAIL_ALREADY_EXISTS)
		}

		// 2. hash password
		const hashedPassword = await this.cryptoService.hashPassword(dto.password)

		// 3. insert user (RAW SQL)
		const result = await this.dataSource.query(
			`
      INSERT INTO users (name, email, password, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, name, email
      `,
			[dto.name, dto.email, hashedPassword],
		)

		const savedUser = result[0]

		const tokens = await this.tokenService.generateTokens({
			userId: savedUser.id,
		})

		return {
			user: savedUser,
			...tokens,
		}
	}

	async login(dto: LoginDto) {
		console.time('login-total')

		console.time('db')
		const result = await this.dataSource.query(
			`
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
			[dto.email],
		)
		console.timeEnd('db')

		const user = result[0]

		console.time('verify')
		const isPasswordMatch = await this.cryptoService.comparePassword(
			dto.password,
			user.password,
		)
		console.timeEnd('verify')

		console.time('jwt')
		const tokens = await this.tokenService.generateTokens({
			userId: user.id,
		})
		console.timeEnd('jwt')

		console.timeEnd('login-total')

		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		}
	}
}

export class AuthModule {}