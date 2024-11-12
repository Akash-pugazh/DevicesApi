import db from '../db/index.js'
import BaseRepository from './base-repository.js'

export default new (class UserRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename)
  }

  async findByEmail({ email }) {
    return await this.find({ email }, true)
  }

  async findByName({ name }) {
    return await db.query(`SELECT * FROM users WHERE name ILIKE $1`, [
      `%${name}%`,
    ])
  }

  async insertUser({ name, email, password }) {
    return await this.insertOne({ name, email, password })
  }
})('users')
