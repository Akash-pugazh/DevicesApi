import bcrypt from 'bcrypt'
import db from '../db/index.js'
import jwt from 'jsonwebtoken'
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
  if (dbResponse.rowCount !== 1) {
    throw new CustomError(404, 'User not found')
  }

  const { password: passwordFromDb, ...userPayload } = dbResponse.rows[0]

  const isValidPassword = await bcrypt.compare(password, passwordFromDb)
  if (!isValidPassword) {
    throw new CustomError(400, 'Invalid Password')
  }

  let accessToken, refreshToken

  const userTokenInDbResponse = await db.query(
    `SELECT * FROM user_tokens WHERE user_id = $1`,
    [userPayload.id]
  )

  if (userTokenInDbResponse.rowCount === 0) {
    ({ accessToken, refreshToken } = createTokens(userPayload))
    await storeTokens(userPayload.id, accessToken, refreshToken)
  } else {
    const tokens = userTokenInDbResponse.rows[0]
    refreshToken = tokens.refresh_token
    accessToken = await validateAccessToken(tokens.access_token, userPayload)
  }
  res.status(200).send({ message: 'Logged In', accessToken, refreshToken })
}

function createTokens(userPayload) {
  const accessToken = jwt.sign(userPayload, process.env.ACCESS_JWT_SECRET, {
    expiresIn: '10m',
  })
  const refreshToken = jwt.sign(userPayload, process.env.REFRESH_JWT_SECRET)
  return { accessToken, refreshToken }
}

async function storeTokens(userId, accessToken, refreshToken) {
  await db.query(
    'INSERT INTO user_tokens(user_id, access_token, refresh_token) VALUES ($1, $2, $3)',
    [userId, accessToken, refreshToken]
  )
}

async function validateAccessToken(accessToken, userPayload) {
  try {
    jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET)
    return accessToken
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      const newAccessToken = jwt.sign(
        userPayload,
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '10m' }
      )
      await db.query(
        `UPDATE FROM user_tokens SET access_token = $2 WHERE user_id = $1`,
        [userPayload.id, newAccessToken]
      )

      return newAccessToken
    }
    throw err
  }
}

async function generateAccessToken(req, res, next) {
  const { refreshToken } = req.body

  const { iat, exp, ...decodedRefreshToken } = jwt.verify(
    refreshToken,
    process.env.REFRESH_JWT_SECRET
  )

  const accessToken = jwt.sign(
    decodedRefreshToken,
    process.env.ACCESS_JWT_SECRET,
    {
      expiresIn: '10m',
    }
  )

  await db.query(
    `UPDATE user_tokens SET access_token = $2 WHERE user_id = $1 AND refresh_token = $3`,
    [decodedRefreshToken.id, accessToken, refreshToken]
  )
  res.status(200).send({ accessToken })
}

export default authRouter
