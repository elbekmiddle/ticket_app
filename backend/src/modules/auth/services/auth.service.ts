import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'src/modules/auth/entities/user.entity'
import { AuthCryptoService } from 'src/modules/auth/services/auth-crypto.service'
import { TokenService } from 'src/modules/auth/services/token.service'
import { DataSource, Repository } from 'typeorm'
import {RegisterDto} from "../dto/register.dto"
import { AuthErrorMessages } from 'src/config/errors'
import { email } from 'zod'
import { LoginDto } from 'src/modules/auth/dto/login.dto'


// @Injectable()
// export class AuthService{
// 	private readonly userRepository: Repository<User>

// 	constructor(
// 		@Inject('DATA_SOURCE')
// 		private readonly dataSource: DataSource,
// 		private readonly cryptoService: AuthCryptoService,
// 		private readonly tokenService: TokenService
// 	) {
// 		this.userRepository = this.dataSource.getRepository(User)
// 	}
	
// 	async register(dto: RegisterDto){
// 		const existingUser = await this.userRepository.findOne({where: {email: dto.email}})	
// 		if(existingUser) {
// 			throw new ConflictException(AuthErrorMessages.EMAIL_ALREADY_EXISTS)
// 		}	

// 		const hashedPassword = await this.cryptoService.hashPassword(dto.password)

// 		const newUSer = this.userRepository.create(
// 			{
// 				name: dto.name,
// 				email: dto.email,
// 				password: hashedPassword
// 			}
// 		)
// 		const savedUser = await this.userRepository.save(newUSer)

// 		const tokens = await this.tokenService.generateTokens({
// 			userId: savedUser.id
// 		})

// 		return{
// 			user: {id: savedUser, name: savedUser.name, email: savedUser.email},
// 				...tokens,
// 			}
// 	}
// 	async login(dto: LoginDto) {
//     // 1. Foydalanuvchini email bo'yicha qidiramiz
//     const user = await this.userRepository.findOne({ where: { email: dto.email } });
//     if (!user) {
//       throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
//     }

//     // 2. Kiritilgan parolni bazadagi heshlangan parol bilan solishtiramiz
//     const isPasswordMatch = await this.cryptoService.comparePassword(dto.password, user.password);
//     if (!isPasswordMatch) {
//       throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
//     }

//     // 3. TokenService yordamida yangi Access va Refresh tokenlarni beramiz
//     const tokens = await this.tokenService.generateTokens({ 
//       userId: user.id, 
//     });

//     return {
//       ...tokens,
//       user: { id: user.id, name: user.name, email: user.email },
//     };
//   }
// }


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

		// 4. tokens
		const tokens = await this.tokenService.generateTokens({
			userId: savedUser.id,
		})

		return {
			user: savedUser,
			...tokens,
		}
	}

	// =========================
	// LOGIN
	// =========================
	async login(dto: LoginDto) {
		// 1. get user (RAW SQL FAST PATH)
		const result = await this.dataSource.query(
			`
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
			[dto.email],
		)

		const user = result[0]

		if (!user) {
			throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS)
		}

		const isPasswordMatch = await this.cryptoService.comparePassword(
			dto.password,
			user.password,
		)

		if (!isPasswordMatch) {
			throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS)
		}

		const tokens = await this.tokenService.generateTokens({
			userId: user.id,
		})

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