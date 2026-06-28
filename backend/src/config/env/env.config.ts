import { envSchema } from './env.schema';

const parsed = envSchema.parse(process.env);

export const env = {
  port: parseInt(parsed.PORT, 10),
  databaseUrl: parsed.DATABASE_URL,
  jwtSecret: parsed.JWT_SECRET,
  jwtRefreshSecret: parsed.JWT_REFRESH_SECRET,
  redisUrl: parsed.REDIS_URL,
};