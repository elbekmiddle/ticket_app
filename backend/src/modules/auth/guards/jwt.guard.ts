import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthErrorMessages } from 'src/config/errors'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(err: any, user: any, info: any) {
		if (err || !user) {
			if (info?.message === 'jwt expired') {
				throw new UnauthorizedException(AuthErrorMessages.TOKEN_EXPIRED)
			}
			throw new UnauthorizedException(AuthErrorMessages.INVALID_TOKEN)
		}
		return user
	}
}
