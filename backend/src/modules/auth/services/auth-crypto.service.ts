import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthCryptoService {
	private readonly rounds = 12

	async hashPassword(password: string) {
		return bcrypt.hash(password, this.rounds)
	}

	async comparePassword(password: string, hash: string) {
		return bcrypt.compare(password, hash)
	}
}
