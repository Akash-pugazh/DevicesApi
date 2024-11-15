import db from '../db/index.js';
import BaseRepository from './base-repository.js';

export default new (class UserRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename);
  }

  async findByEmail({ email }) {
    return await db.oneOrNone(`SELECT * FROM users WHERE email = $1 AND isactive = TRUE`, [email]);
  }

  async findByName({ name }) {
    return await this.customQuery(`SELECT * FROM users WHERE name ILIKE $1`, [`%${name}%`]);
  }

  async deleteById({ id }) {
    return await this.customQuery(`UPDATE users SET isactive = FALSE WHERE id = $1`, [id]);
  }

  async insertUser({ name, email, password, isadmin }) {
    return await this.insertOne({ name, email, password, isadmin });
  }
})('users');
