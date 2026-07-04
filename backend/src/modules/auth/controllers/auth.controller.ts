import { Controller, Post, Body, BadRequestException, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { registerSchema } from '../dto/register.dto';
import { loginSchema } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { verifyEmailSchema, VerifyEmailDto } from 'src/modules/auth/dto/verify-email.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return new BadRequestException(parseResult.error.issues[0].message);
    }
    return this.authService.register(parseResult.data);
  }

  @Post('login')
  async login(@Body() body: any) {
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return new BadRequestException(parseResult.error.issues[0].message);
    } 
    return this.authService.login(parseResult.data);
  }
  

  @Post("verify-email")
  verifyEmail(@Body() body: any) {

    const parse = verifyEmailSchema.safeParse(body)

    if (!parse.success) {
      throw new BadRequestException(
        parse.error.issues[0].message,
      )
    }

    return this.authService.verifyEmail(parse.data)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return {
      success: true,
      user: req.user,
    };
  }
}