import usertokensRepository from '../repository/usertokens-repository.js';
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

  const tokenData = await usertokensRepository.findOne({
    access_token: accessToken
  });
  if (!tokenData || tokenData.expiresat.getTime() < Date.now()) {
    throw new CustomError({ statusCode: 401, errorMessage: 'Unauthorized' });
  }
  req.userId = tokenData.user_id;
  next();
}
