import db from '../db/index.js';
import BaseRepository from './base-repository.js';

export class UserRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename);
  }

  updatePassword({ id, password }) {
    return this.update({ password }, { id });
  }

  findUsers({ isactive = true } = {}) {
    return this.find({ isactive });
  }

  findUsersByName({ name }) {
    return this.find({ name }, { isPartialFind: true });
  }

  findByEmail({ email }) {
    return this.findOne({ email });
  }

  findUserById({ id, isactive = true } = {}) {
    return this.findOne({ id, isactive });
  }

  findByName({ name }) {
    return this.customQuery(`SELECT * FROM users WHERE name ILIKE $1`, [`%${name}%`]);
  }

  deleteUserById({ id }) {
    return this.customQuery(`UPDATE users SET isactive = FALSE WHERE id = $1`, [id]);
  }

  insertUser({ name, email, password, isadmin }) {
    return this.insertOne({ name, email, password, isadmin });
  }
}

export default new UserRepository('users');
