import db from '../db/index.js'
import CustomError from '../util/CustomError.js'

export default async function (req, res, next) {
  if (
    req.originalUrl
      .split('/')
      .filter(el => el.length > 1)
      .includes('auth')
  ) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader) throw new CustomError(401, 'Auth Header not found')

  const accessToken = authHeader.split(' ')[1]
  if (!accessToken) throw new CustomError(401, 'Access token not found')

  const { rowCount, rows } = await db.query(
    `SELECT * FROM user_tokens WHERE access_token = $1`,
    [accessToken]
  )
  if (rowCount !== 1) {
    throw new Error('Invalid Access Token')
  }
  const tokenData = rows[0]
  if (tokenData.expiresat.getTime() < Date.now()) {
    throw new Error('Token Expired')
  }
  req.userId = tokenData.user_id
  next()
}
