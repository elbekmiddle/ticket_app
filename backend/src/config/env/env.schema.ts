import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('8080'),
  
  DATABASE_URL: z.string().default(''), 
  
  JWT_SECRET: z.string().default(''),
  JWT_REFRESH_SECRET: z.string().default(''),
  
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
});