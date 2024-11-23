import UserService from '../services/user-service.js';
import TokensService from '../services/tokens-service.js';
import HttpCodes from '../util/httpCodes.js';

export default new (class AuthController {
  async loginUser(req, res) {
    const { email, password } = req.body;
    const response = await UserService.findUserByEmail({ email });

    const { password: hashedPwdFromDb, ...userPayload } = response;
    UserService.compareUserPassword({ password, hashedPwd: hashedPwdFromDb });

    const { access_token, refresh_token } = await TokensService.generateTokens({ user_id: userPayload.id });

    res.status(HttpCodes.OK).send({
      message: 'Logged In',
      accessToken: access_token,
      refreshToken: refresh_token
    });
  }

  async refreshUserToken(req, res) {
    const { refreshToken: refresh_token } = req.body;

    await TokensService.findRecordByRefreshToken({ refresh_token });

    const { access_token: accessToken, refresh_token: refreshToken } =
      await TokensService.updateAccessTokenByRefreshToken({ refresh_token });

    res.status(HttpCodes.OK).send({
      message: 'Access Token generated',
      accessToken,
      refreshToken
    });
  }
})();
