import db from '../db/index.js'
import usertokensRepository from '../repository/usertokens-repository.js'
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
  const tokenData = await usertokensRepository.findOne({
    access_token: accessToken,
  })
  if (!tokenData) {
    throw new Error('Invalid Access Token')
  }
  if (tokenData.expiresat.getTime() < Date.now()) {
    throw new Error('Token Expired')
  }
  req.userId = tokenData.user_id
  next()
}
