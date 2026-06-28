import { z } from 'zod';
import { EnvErrorMessages } from '../errors';

export const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1, { message: EnvErrorMessages.DATABASE_URL_REQUIRED }),
  JWT_SECRET: z.string().min(10, { message: EnvErrorMessages.JWT_SECRET_SHORT }),
  JWT_REFRESH_SECRET: z.string().min(10, { message: EnvErrorMessages.JWT_REFRESH_SECRET_SHORT }),
  REDIS_URL: z.string().min(1, { message: EnvErrorMessages.REDIS_URL_REQUIRED }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	API_PREFIX: z.string().default('/api/v1')
});