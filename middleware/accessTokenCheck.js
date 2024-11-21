import usertokensRepository from '../repository/usertokens-repository.js';
import { ConstructError } from '../services/auth-service.js';
import CustomError from '../util/CustomError.js';

export default async function (req, res, next) {
  const canSkipRoute = req.originalUrl
    .split('/')
    .filter(el => el.length > 1)
    .some(route => route === 'docs' || route === 'auth');
  if (canSkipRoute) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new CustomError({
      statusCode: 401,
      errorMessage: 'Auth Header not found'
    });
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    throw new CustomError({
      statusCode: 401,
      errorMessage: 'Access token not found'
    });
  }
  (
    await usertokensRepository.findOne({
      access_token: accessToken
    })
  )
    .setupError(ConstructError({ statusCode: 401, errorMessage: 'Unauthorized' }))
    .setErrorCondition(data => !data || data.expiresat.getTime() < Date.now())
    .build(data => (req.userId = data.user_id));
  next();
}
