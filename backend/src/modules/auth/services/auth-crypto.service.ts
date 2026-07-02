import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as argon2 from "argon2"
@Injectable()
export class AuthCryptoService {
  private readonly saltRounds = 8;

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 13,
      timeCost: 2,
      parallelism: 1,
    })
    // return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password)
  }
}