import CustomError from '../util/CustomError.js'
import bcrypt from 'bcrypt'
import UserRepository from '../repository/user-repository.js'
import UserTokensRepository from '../repository/usertokens-repository.js'

export default new (class AuthService {
  async loginUser(req, res) {
    const { email, password } = req.body
    const dbResponse = await UserRepository.findByEmail({ email })
    if (dbResponse.rowCount !== 1) throw new CustomError(404, 'User not found')

    const { password: passwordFromDb, ...userPayload } = dbResponse.rows[0]
    const isValidPassword = await bcrypt.compare(password, passwordFromDb)
    if (!isValidPassword) throw new CustomError(400, 'Invalid Password')

    const { rowCount, rows } = await UserTokensRepository.findByUserId({
      user_id: userPayload.id,
    })
    
    const { access_token, refresh_token } =
      rowCount === 0
        ? await AuthService.#createAndStoreTokens(userPayload.id)
        : rows[0].expiresat.getTime() < new Date().getTime()
        ? await AuthService.#updateAccessToken(userPayload.id)
        : rows[0]

    res.status(200).send({
      message: 'Logged In',
      accessToken: access_token,
      refreshToken: refresh_token,
    })
  }

  async generateAccessToken(req, res, next) {
    const { refreshToken } = req.body

    const { rows, rowCount } = await UserTokensRepository.find({
      refresh_token: refreshToken,
    })

    if (rowCount !== 1) {
      throw new CustomError(401, 'Invalid Refresh Token')
    }
    const data = await AuthService.#updateAccessToken(rows[0].user_id)
    res.status(200).send({
      message: 'Access Token generated',
      accessToken: data.access_token,
      refreshToken,
    })
  }

  static async #createAndStoreTokens(userId) {
    const { rows } = await UserTokensRepository.insertTokens({
      user_id: userId,
    })
    return rows[0]
  }

  static async #updateAccessToken(userId) {
    const { rows } = await UserTokensRepository.updateAccessToken({
      user_id: userId,
    })

    return rows[0]
  }
})()
