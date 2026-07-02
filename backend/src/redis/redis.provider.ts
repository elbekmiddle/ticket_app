import Redis from "ioredis"
import { Env } from 'src/config/env/env.config'

export const RedisProvider = {
	provide: 'REDIS_CLIENT',
	useFactory: async () => {
		return new Redis((Env.REDIS_URL, {
			maxLoadingRetryTime: 10000,
			enableReadyCheck: true,
			}))
	}}
