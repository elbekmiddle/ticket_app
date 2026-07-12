import { Global, Module } from '@nestjs/common'
import { DatabaseProvider } from 'src/database/database-provider'

@Global()
@Module({
	providers: [
		DatabaseProvider
	],
	exports: [
		DatabaseProvider
	]
})

export class DatabaseModule {}
