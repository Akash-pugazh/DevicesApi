import { config } from 'dotenv'

config()

export const Config = {
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: process.env.PORT,
  TOKEN_EXPIRY: process.env.EXPIRES_AT,
  SALT_ROUNDS: +process.env.SALT_ROUNDS,
}
