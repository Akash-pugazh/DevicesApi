import CustomError, { ERROR_TYPES } from '../util/CustomError.js';
import bcrypt from 'bcrypt';
import UserRepository from '../repository/user-repository.js';
import UserTokensRepository from '../repository/usertokens-repository.js';

export function ConstructError({ statusCode, errorType = ERROR_TYPES.SIMPLE, errorMessage }) {
  return new CustomError({ statusCode, errorType, errorMessage });
}

export class AuthService {
  async loginUser(req, res) {
    const { email, password } = req.body;
    const caseInsensitiveEmail = email.toLowerCase().trim();

    const dbResponse = await UserRepository.findByEmail({ email: caseInsensitiveEmail, isActive: true }).then(data => {
      return data
        .setupError(ConstructError({ statusCode: 404, errorMessage: 'User Not Found' }))
        .setErrorCondition(data => !data)
        .build();
    });

    const { password: passwordFromDb, ...userPayload } = dbResponse;
    const isValidPassword = await bcrypt.compare(password, passwordFromDb);
    if (!isValidPassword) {
      throw new CustomError({
        statusCode: 400,
        errorMessage: 'Invalid Password'
      });
    }

    const { access_token, refresh_token } = await AuthService.#createAndStoreTokens(userPayload.id).then(data => {
      return data.build();
    });

    res.status(200).send({
      message: 'Logged In',
      accessToken: access_token,
      refreshToken: refresh_token
    });
  }

  async generateAccessToken(req, res) {
    const { refreshToken } = req.body;
    await UserTokensRepository.findOne({ refresh_token: refreshToken }).then(data => {
      return data
        .setupError(ConstructError({ statusCode: 401, errorMessage: 'Invalid Refresh Token' }))
        .setErrorCondition(data => !data)
        .build();
    });

    const data = await AuthService.#updateAccessToken(refreshToken).then(data => {
      return data.build();
    });
    
    res.status(200).send({
      message: 'Access Token generated',
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    });
  }

  static async #createAndStoreTokens(userId) {
    return await UserTokensRepository.insertTokens({
      user_id: userId
    });
  }

  static async #updateAccessToken(refreshToken) {
    return await UserTokensRepository.updateAccessToken({
      refresh_token: refreshToken
    });
  }
}

export default new AuthService();
