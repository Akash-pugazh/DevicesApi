import { ErrorFactory, ERROR_HTTP_CODES } from '../util/CustomError.js';
import { Config } from '../config.js';
import tokensService from '../services/tokens-service.js';

export default async function (req, res, next) {
  const canSkipRoute = req.originalUrl
    .split('/')
    .filter(el => el.length > 1)
    .some(route => Config.ROUTES_TO_SKIP_FROM_AUTH.includes(route));
  if (canSkipRoute) {
    return next();
  }

  const accessToken = req.headers.authorization?.split(' ')[1];
  if (!accessToken) ErrorFactory.throwError(ERROR_HTTP_CODES.UNAUTHORIZED);

  const { user_id } = await tokensService.getTokenRecordByAccessToken({ access_token: accessToken });
  req.userId = user_id;
  next();
}
