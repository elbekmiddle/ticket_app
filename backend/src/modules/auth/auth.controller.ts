import { Controller, Post, Body, BadRequestException, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    // req.user ichida JwtStrategy.validate() dan qaytgan userId va email bo'ladi
    return {
      success: true,
      user: req.user,
    };
  }
}