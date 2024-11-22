import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const Config = Object.freeze({
  ROOT_DIR,
  OPEN_API_PATH: `${ROOT_DIR}/routes/docs/openapi.json`,
  ROUTES_BASE_PATH: `routes`,
  ROUTES_TO_SKIP_FROM_AUTH: ['docs', 'auth'],
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: process.env.PORT,
  TOKEN_EXPIRY: process.env.EXPIRES_AT,
  SALT_ROUNDS: +process.env.SALT_ROUNDS
});
