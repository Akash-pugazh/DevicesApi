import usertokensRepository from '../repository/usertokens-repository.js';
import { CustomError } from '../util/CustomError.js';
import { Config } from '../config.js';

export default async function (req, res, next) {
  const canSkipRoute = req.originalUrl
    .split('/')
    .filter(el => el.length > 1)
    .some(route => Config.ROUTES_TO_SKIP_FROM_AUTH.includes(route));
  if (canSkipRoute) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw CustomError({
      statusCode: 401,
      errorMessage: 'Auth Header not found'
    });
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    throw CustomError({
      statusCode: 401,
      errorMessage: 'Access token not found'
    });
  }
  const data = await usertokensRepository.findOne({ access_token: accessToken }).then(data => {
    return data
      .setupError(CustomError({ statusCode: 401, errorMessage: 'Unauthorized' }))
      .setErrorCondition(data => !data || data.expiresat.getTime() < Date.now())
      .build();
  });
  req.userId = data.user_id;
  next();
}
