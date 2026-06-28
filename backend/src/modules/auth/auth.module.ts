import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
import { AuthCryptoService } from './services/auth-crypto.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

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
    JwtStrategy 
  ],
  exports: [PassportModule, JwtStrategy], 
})
export class AuthModule {}