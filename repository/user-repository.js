import db from '../db/index.js';
import BaseRepository from './base-repository.js';

export default new (class UserRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename);
  }

  updatePassword({ id, password }) {
    return this.update({ password }, { id });
  }

  fetchAllUsers() {
    return this.getAll();
  }

  findByEmail({ email, isActive }) {
    return this.findOne({ email, isActive });
  }

  findUserById({ id }) {
    return this.findOne({ id });
  }

  findByName({ name }) {
    return this.customQuery(`SELECT * FROM users WHERE name ILIKE $1`, [`%${name}%`]);
  }

  deleteById({ id }) {
    return this.customQuery(`UPDATE users SET isactive = FALSE WHERE id = $1`, [id]);
  }

  insertUser({ name, email, password, isadmin }) {
    return this.insertOne({ name, email, password, isadmin });
  }
})('users');
