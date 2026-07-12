import { Module } from '@nestjs/common'
import { UsersController } from './controllers/users.controller'
import { UsersService } from './services/users.service'
import { AuthModule } from 'src/modules/auth/auth.module'

@Module({
	imports: [AuthModule], // UserRepository AuthModule'dan export qilingan — qayta yozishning hojati yo'q
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule { }
