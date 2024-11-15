import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

config();

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const Config = Object.freeze({
  ROOT_DIR: ROOT_DIR,
  OPEN_API_PATH: `${ROOT_DIR}/openapi.yml`,
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: process.env.PORT,
  TOKEN_EXPIRY: process.env.EXPIRES_AT,
  SALT_ROUNDS: +process.env.SALT_ROUNDS
});
