import bcrypt from 'bcrypt'
import db from '../db/index.js'
import { Router } from 'express'
import { validateFields } from '../util/vaildator.js'
import { ValidationConstraint } from '../util/vaildator.js'
import tryCatchWrapper from '../util/tryCatchWrapper.js'
import CustomError from '../util/CustomError.js'

const authRouter = Router()

export const LoginValidationFields = {
  password: new ValidationConstraint({
    fieldType: 'string',
    minLength: 8,
    maxLength: 20,
  }),
  email: new ValidationConstraint({
    fieldType: 'string',
    minLength: 12,
  }),
}

export const RefreshValidationFields = {
  refreshToken: new ValidationConstraint({ fieldType: 'string' }),
}

authRouter
  .route('/login')
  .post(validateFields(LoginValidationFields), tryCatchWrapper(loginUser))

authRouter
  .route('/refresh')
  .post(
    validateFields(RefreshValidationFields),
    tryCatchWrapper(generateAccessToken)
  )

async function loginUser(req, res, next) {
  const { email, password } = req.body

  const dbResponse = await db.query('SELECT * FROM users where email = $1', [
    email,
  ])
  if (dbResponse.rowCount !== 1) throw new CustomError(404, 'User not found')

  const { password: passwordFromDb, ...userPayload } = dbResponse.rows[0]
  const isValidPassword = await bcrypt.compare(password, passwordFromDb)
  if (!isValidPassword) throw new CustomError(400, 'Invalid Password')

  const { rowCount, rows } = await db.query(
    `SELECT * FROM user_tokens WHERE user_id = $1`,
    [userPayload.id]
  )

  const { access_token, refresh_token } =
    rowCount === 0
      ? await createAndStoreTokens(userPayload.id)
      : rows[0].expiresat.getTime() < new Date().getTime()
      ? await updateAccessToken(userPayload.id)
      : rows[0]

  res.status(200).send({
    message: 'Logged In',
    accessToken: access_token,
    refreshToken: refresh_token,
  })
}

async function updateAccessToken(userId) {
  const { rows } = await db.query(
    `UPDATE user_tokens SET access_token = GEN_RANDOM_UUID(), expiresat = NOW() + $2 * INTERVAL '1 MINUTE' WHERE user_id = $1 RETURNING *`,
    [userId, process.env.EXPIRES_AT]
  )
  return rows[0]
}

async function createAndStoreTokens(userId) {
  const { rows } = await db.query(
    `INSERT INTO user_tokens(user_id, access_token, refresh_token, expiresAt) VALUES ($1, gen_random_uuid(), gen_random_uuid(), NOW() + $2 * INTERVAL '1 MINUTE') RETURNING *`,
    [userId, process.env.EXPIRES_AT]
  )
  return rows[0]
}

async function generateAccessToken(req, res, next) {
  const { refreshToken } = req.body

  const { rows, rowCount } = await db.query(
    'SELECT * FROM user_tokens WHERE refresh_token = $1',
    [refreshToken]
  )

  if (rowCount !== 1) {
    throw new CustomError(401, 'Invalid Refresh Token')
  }
  const data = await updateAccessToken(rows[0].user_id)
  res.status(200).send({
    message: 'Access Token generated',
    accessToken: data.access_token,
    refreshToken,
  })
}

export default authRouter
