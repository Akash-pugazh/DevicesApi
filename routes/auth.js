import { Router } from 'express'
import { validateFields } from './users.js'
import db from '../db/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import accessTokenCheck from '../middleware/accessTokenCheck.js'

const authRouter = Router()

export class ValidationCheck {
  constructor({ fieldType, minLength, maxLength }) {
    this.fieldType = fieldType
    this.minLength = minLength ?? 1
    this.maxLength = maxLength ?? Number.POSITIVE_INFINITY
  }
}

export const LoginValidationFields = {
  password: new ValidationCheck({
    fieldType: 'string',
    minLength: 8,
    maxLength: 20,
  }),
  email: new ValidationCheck({
    fieldType: 'string',
    minLength: 12,
  }),
}

authRouter
  .route('/login')
  .post(validateFields(LoginValidationFields), loginUser)

authRouter.post(
  '/refresh',
  validateFields({
    refreshToken: new ValidationCheck({ fieldType: 'string' }),
  }),
  async (req, res, next) => {
    const { refreshToken } = req.body

    try {
      const { iat, exp, ...decodedRefreshToken } = jwt.verify(
        refreshToken,
        process.env.REFRESH_JWT_SECRET
      )

      // check if refresh token with user id mapped in db

      const dbResForRefreshTokenFetch = await db.query(
        `SELECT * FROM user_tokens WHERE user_id = $1 AND refresh_token = $2`,
        [decodedRefreshToken.id, refreshToken]
      )
      if (dbResForRefreshTokenFetch.rowCount !== 1) {
        throw new Error('Invalid Token in Db, Logout And login again')
      }
      const accessToken = jwt.sign(
        decodedRefreshToken,
        process.env.ACCESS_JWT_SECRET,
        {
          expiresIn: '10s',
        }
      )

      // Update the token
      await db.query(
        `UPDATE user_tokens SET access_token = $2 WHERE user_id = $1 AND refresh_token = $3`,
        [decodedRefreshToken.id, accessToken, refreshToken]
      )

      res.status(200).json({ accessToken: accessToken })
    } catch (err) {
      next(err)
    }
  }
)

async function loginUser(req, res, next) {
  const { email, password } = req.body
  try {
    const response = await db.query('SELECT * FROM users where email = $1', [
      email,
    ])
    const { password: passwordFromDb, ...userPayload } = await response.rows[0]
    if (response.rowCount !== 1) throw new Error('Invalid User Credentials')

    const isCrtPwd = await bcrypt.compare(password, passwordFromDb)
    if (!isCrtPwd) throw new Error('Invalid Password')

    let accessToken, refreshToken

    const existingTokensResponse = await db.query(
      `SELECT * FROM user_tokens WHERE user_id = $1`,
      [userPayload.id]
    )

    if (existingTokensResponse.rowCount === 0) {
      accessToken = jwt.sign(userPayload, process.env.ACCESS_JWT_SECRET, {
        expiresIn: '10s',
      })
      refreshToken = jwt.sign(userPayload, process.env.REFRESH_JWT_SECRET)
      await db.query(
        `INSERT INTO user_tokens(user_id, access_token, refresh_token) VALUES ($1, $2, $3)`,
        [userPayload.id, accessToken, refreshToken]
      )
    } else {
      accessToken = existingTokensResponse.rows[0].access_token
      refreshToken = existingTokensResponse.rows[0].refresh_token
    }
    res.status(200).json({ msg: 'Logged In', accessToken, refreshToken })
  } catch (err) {
    next(err)
  }
}

export default authRouter
