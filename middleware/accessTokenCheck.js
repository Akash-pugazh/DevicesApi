import jwt from 'jsonwebtoken'
import db from '../db/index.js'
import CustomError from '../util/CustomError.js'

export default async function (req, res, next) {
  try {
    let accessToken = req.headers.authorization.split(' ')[1]
    if (!accessToken) throw new CustomError(401, 'Access token not found')
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_JWT_SECRET
    )
    const { rowCount } = await db.query(
      `SELECT * FROM user_tokens WHERE user_id = $1 AND access_token = $2`,
      [decodedAccessToken.id, accessToken]
    )
    if (rowCount === 1) {
      req.userId = decodedAccessToken.id
      next()
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ msg: 'Access Token Expired' })
    } else {
      next(err)
    }
  }
}
