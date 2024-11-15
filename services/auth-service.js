import CustomError from '../util/CustomError.js'
import bcrypt from 'bcrypt'
import UserRepository from '../repository/user-repository.js'
import UserTokensRepository from '../repository/usertokens-repository.js'

export default new (class AuthService {
  async loginUser(req, res) {
    const { email, password } = req.body
    const dbResponse = await UserRepository.findByEmail({ email })
    if (!dbResponse) throw new CustomError(404, 'User not found')

    const { password: passwordFromDb, ...userPayload } = dbResponse
    const isValidPassword = await bcrypt.compare(password, passwordFromDb)
    if (!isValidPassword) throw new CustomError(400, 'Invalid Password')

    const { access_token, refresh_token } =
      await AuthService.#createAndStoreTokens(userPayload.id)

    res.status(200).send({
      message: 'Logged In',
      accessToken: access_token,
      refreshToken: refresh_token,
    })
  }

  async generateAccessToken(req, res) {
    const { refreshToken } = req.body

    const dbRes = await UserTokensRepository.findOne({
      refresh_token: refreshToken,
    })

    if (!dbRes) {
      throw new CustomError(401, 'Invalid Refresh Token')
    }
    const data = await AuthService.#updateAccessToken(dbRes.user_id)
    res.status(200).send({
      message: 'Access Token generated',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    })
  }

  static async #createAndStoreTokens(userId) {
    return await UserTokensRepository.insertTokens({
      user_id: userId,
    })
  }

  static async #updateAccessToken(userId) {
    return await UserTokensRepository.updateAccessToken({
      user_id: userId,
    })
  }
})()
