import jwt from 'jsonwebtoken'
import db from '../db/index.js'

export default async function (req, res, next) {
  const refreshToken = req.cookies.refreshToken
  let accessToken = req.headers.authorization
  if (!refreshToken || !accessToken) throw new Error('Tokens missing')

  accessToken = accessToken.split(' ')[1]

  try {
    // jwt check
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_JWT_SECRET
    )
    // use details to verify with db
    const dbRes = await db.query(
      `SELECT * FROM user_tokens WHERE user_id = $1 AND access_token = $2`,
      [decodedAccessToken.id, accessToken]
    )
    if (dbRes.rowCount === 1) next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ msg: 'Access Token Expired' })
    }
  }
}
