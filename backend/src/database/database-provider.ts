import { pool } from 'src/database/data-source'

export const DatabaseProvider = {
	provide: "DATABASE_POOL",
	useValue: pool
}