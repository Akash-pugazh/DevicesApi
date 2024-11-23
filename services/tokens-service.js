import UsertokensRepository from '../repository/usertokens-repository.js';
import { ErrorFactory, HTTP_CODES } from '../util/CustomError.js';

export class TokensService {
  generateTokens = async ({ user_id }) => {
    return UsertokensRepository.insertTokens({ user_id }).then(data => data.build());
  };

  findRecordByRefreshToken = async ({ refresh_token }) => {
    return await UsertokensRepository.findOne({ refresh_token }).then(data => {
      return data
        .setupError(ErrorFactory.createError(HTTP_CODES.BAD_REQUEST, 'Invalid Refresh Token'))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  updateAccessTokenByRefreshToken = async ({ refresh_token }) => {
    return await UsertokensRepository.updateAccessToken({ refresh_token }).then(data => data.build());
  };

  getTokenRecordByAccessToken = async ({ access_token }) => {
    return await UsertokensRepository.findByAccessToken({ access_token }).then(data => {
      return data
        .setupError(ErrorFactory.createError(HTTP_CODES.UNAUTHORIZED))
        .setErrorCondition(data => !data || data.expiresat.getTime() < Date.now())
        .build();
    });
  };
}

export default new TokensService();
