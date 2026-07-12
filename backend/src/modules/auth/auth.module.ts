import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { AuthCryptoService } from './services/auth-crypto.service'
import { TokenService } from './services/token.service'
import { OtpService } from './services/otp.service'
import { EmailService } from './services/email.service'
import { UserRepository } from './repositories/user.repository'
import { JwtStrategy } from './strategies/jwt.strategy'
import { MailModule } from 'src/mail/mail.module'

@Module({
	imports: [PassportModule, JwtModule.register({}), MailModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		AuthCryptoService,
		TokenService,
		OtpService,
		EmailService,
		UserRepository,
		JwtStrategy,
	],
	exports: [UserRepository],
})
export class AuthModule { }
