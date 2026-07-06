import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './controllers/auth.controller';
import { AuthCryptoService } from './services/auth-crypto.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from 'src/modules/auth/services/auth.service'
import { OtpService } from 'src/modules/auth/services/otp.service'
import { EmailService } from 'src/modules/auth/services/email.service'
import { RedisModule } from 'src/redis/redis.module'
import { DatabaseProvider } from 'src/database/database-provider'
import { UserRepository } from 'src/modules/auth/repositories/user.repository'

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    // AuthService, 
    AuthCryptoService, 
    TokenService, 
    JwtStrategy,
    AuthService,
    OtpService,
    EmailService,
    UserRepository
  ],
  exports: [PassportModule, JwtStrategy], 
})
export class AuthModule {}