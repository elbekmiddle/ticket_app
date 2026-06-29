import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'src/modules/auth/entities/user.entity'
import { AuthCryptoService } from 'src/modules/auth/services/auth-crypto.service'
import { TokenService } from 'src/modules/auth/services/token.service'
import { DataSource, Repository } from 'typeorm'
import {RegisterDto} from "./dto/register.dto"
import { AuthErrorMessages } from 'src/config/errors'
import { email } from 'zod'
import { LoginDto } from 'src/modules/auth/dto/login.dto'
@Injectable()
export class AuthService{
	private readonly userRepository: Repository<User>

	constructor(
		@Inject('DATA_SOURCE')
		private readonly dataSource: DataSource,
		private readonly cryptoService: AuthCryptoService,
		private readonly tokenService: TokenService
	) {
		this.userRepository = this.dataSource.getRepository(User)
	}
	
	async register(dto: RegisterDto){
		const existingUser = await this.userRepository.findOne({where: {email: dto.email}})	
		if(existingUser) {
			throw new ConflictException(AuthErrorMessages.EMAIL_ALREADY_EXISTS)
		}	

		const hashedPassword = await this.cryptoService.hashPassword(dto.password)

		const newUSer = this.userRepository.create(
			{
				name: dto.name,
				email: dto.email,
				password: hashedPassword
			}
		)
		const savedUser = await this.userRepository.save(newUSer)

		const tokens = await this.tokenService.generateTokens({
			userId: savedUser.id
		})

		return{
			user: {id: savedUser, name: savedUser.name, email: savedUser.email},
				...tokens,
			}
	}
	async login(dto: LoginDto) {
    // 1. Foydalanuvchini email bo'yicha qidiramiz
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    // 2. Kiritilgan parolni bazadagi heshlangan parol bilan solishtiramiz
    const isPasswordMatch = await this.cryptoService.comparePassword(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    // 3. TokenService yordamida yangi Access va Refresh tokenlarni beramiz
    const tokens = await this.tokenService.generateTokens({ 
      userId: user.id, 
    });

    return {
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}

export class AuthModule {}