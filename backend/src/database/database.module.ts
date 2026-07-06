import { Module } from '@nestjs/common'
import { DatabaseProvider } from 'src/database/database-provider'

@Module({
	providers: [
		DatabaseProvider
	],
	exports: [
		DatabaseProvider
	]
})

export class DatabaseModule {}