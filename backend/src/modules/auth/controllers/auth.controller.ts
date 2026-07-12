import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthService } from '../services/auth.service'
import { registerSchema, RegisterDto } from '../dto/register.dto'
import { JwtAuthGuard } from '../guards/jwt.guard'

import { verifyEmailSchema, VerifyEmailDto } from '../dto/verify-email.dto'
import { ResetPasswordDto, resetPasswordSchema } from '../dto/reset-password.dto'
import { ForgotPasswordDto, forgotPasswordSchema } from '../dto/ForgotPassword.dto'

import { loginSchema } from '../schemas/login.schema'
import { LoginDto } from '../dto/login.dto'


@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) { }


  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered',
  })
  async register(
    @Body() dto: RegisterDto,
  ) {

    const parseResult = registerSchema.safeParse(dto)

    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.issues[0].message,
      )
    }

    return this.authService.register(parseResult.data)
  }


  @Post('login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiBody({
    type: LoginDto,
  })
  async login(
    @Body() dto: LoginDto,
  ) {

    const parseResult = loginSchema.safeParse(dto)

    if (!parseResult.success) {
      throw new BadRequestException(
        parseResult.error.issues[0].message,
      )
    }

    return this.authService.login(parseResult.data)
  }


  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email with OTP',
  })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ) {

    const parse = verifyEmailSchema.safeParse(dto)

    if (!parse.success) {
      throw new BadRequestException(
        parse.error.issues[0].message,
      )
    }

    return this.authService.verifyEmail(parse.data)
  }


  @Post('forgot-password')
  @ApiOperation({
    summary: 'Send reset password OTP',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ) {

    const parse = forgotPasswordSchema.safeParse(dto)

    if (!parse.success) {
      throw new BadRequestException(
        parse.error.issues[0].message,
      )
    }

    return this.authService.forgotPassword(parse.data)
  }


  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ) {

    const parse = resetPasswordSchema.safeParse(dto)

    if (!parse.success) {
      throw new BadRequestException(
        parse.error.issues[0].message,
      )
    }

    return this.authService.resetPassword(parse.data)
  }


  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
  })
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Req() req: any,
  ) {
    return {
      success: true,
      user: req.user,
    }
  }
}