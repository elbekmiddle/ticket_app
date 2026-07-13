import { z } from 'zod';
import { EnvErrorMessages } from '../errors';

export const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1, { message: EnvErrorMessages.DATABASE_URL_REQUIRED }),
  JWT_SECRET: z.string().min(10, { message: EnvErrorMessages.JWT_SECRET_SHORT }),
  JWT_REFRESH_SECRET: z.string().min(10, { message: EnvErrorMessages.JWT_REFRESH_SECRET_SHORT }),
  REDIS_URL: z.string().min(1, { message: EnvErrorMessages.REDIS_URL_REQUIRED }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  RESEND_API_KEY: z.string().min(1, { message: 'RESEND_API_KEY_REQUIRED' }),
  MAIL_FROM: z.string().email(),

  // AWS — ixtiyoriy. Sozlanmagan bo'lsa ilova baribir ishga tushadi,
  // faqat /admin/media/upload-url chaqirilganda "AWS_NOT_CONFIGURED" xatosi beradi.
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(),

  // Faqat local dev uchun — production'da HECH QACHON true bo'lmasin.
  // true bo'lsa, movie.videoUrl/posterUrl uchun domen tekshiruvi o'chadi.
  ALLOW_EXTERNAL_MEDIA_URLS: z.coerce.boolean().default(false),
});
