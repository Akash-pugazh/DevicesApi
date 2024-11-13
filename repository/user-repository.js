import db from '../db/index.js'
import BaseRepository from './base-repository.js'

export default new (class UserRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename)
  }

  async findByEmail({ email }) {
    return await db.oneOrNone(`SELECT * FROM ${this.table} WHERE email = $1`, [
      email,
    ])
  }

  async findByName({ name }) {
    return await this.customQuery(`SELECT * FROM users WHERE name ILIKE $1`, [
      `%${name}%`,
    ])
  }

  async insertUser({ name, email, password }) {
    return await this.insertOne({ name, email, password })
  }
})('users')
