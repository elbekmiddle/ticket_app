import { Env } from 'src/config/env/env.config'
import {DataSource} from "typeorm"


export const AppDataSource = new DataSource({
	type: 'postgres',
	url: Env?.DATABASE_URL,
	

	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
	migrations: [__dirname + '/migrations/*{.ts,.js'],

	synchronize: false,
	logging: Env?.NODE_ENV === "development"
})