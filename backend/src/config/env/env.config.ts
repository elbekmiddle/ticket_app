import 'dotenv/config'

import { EnvErrorMessages } from 'src/config/errors'
import { envSchema } from './env.schema';

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(EnvErrorMessages.INVALID_ENV);
  console.error(result.error.format());

  process.exit(1);
}

export const Env = result.data;