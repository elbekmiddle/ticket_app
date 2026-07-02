import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './controllers/auth.controller';
import { AuthCryptoService } from './services/auth-crypto.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from 'src/modules/auth/services/auth.service'

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}), 
  ],
  controllers: [AuthController],
  providers: [
    // AuthService, 
    AuthCryptoService, 
    TokenService, 
    JwtStrategy,
    AuthService
  ],
  exports: [PassportModule, JwtStrategy], 
})
export class AuthModule {}