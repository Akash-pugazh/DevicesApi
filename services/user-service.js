import bcrypt from 'bcrypt'
import UserRepository from '../repository/user-repository.js'
import { Config } from '../config.js'

export default new (class UserService {
  async getUsers(req, res, next) {
    const { q } = req.query
    const { rows: data } =
      q?.length >= 1
        ? await UserRepository.findByName({ name: q })
        : await UserRepository.getAll()

    res.status(200).send(data)
  }

  async createUser(req, res, next) {
    const { name, email, password } = req.body
    const hashedPwd = bcrypt.hashSync(password, Config.SALT_ROUNDS)
    const { rows: data } = await UserRepository.insertUser({
      name,
      email,
      password: hashedPwd,
    })
    res.status(201).send(data[0])
  }
})()
