import UsertokensRepository from '../repository/usertokens-repository.js';
import { CustomError } from '../util/CustomError.js';

export class TokensService {
  generateTokens = async ({ user_id }) => {
    return UsertokensRepository.insertTokens({ user_id }).then(data => data.build());
  };

  findRecordByRefreshToken = async ({ refresh_token }) => {
    return await UsertokensRepository.findOne({ refresh_token }).then(data => {
      return data
        .setupError(CustomError({ statusCode: 401, errorMessage: 'Invalid Refresh Token' }))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  updateAccessTokenByRefreshToken = async ({ refresh_token }) => {
    return await UsertokensRepository.updateAccessToken({ refresh_token }).then(data => data.build());
  };
}

export default new TokensService();
