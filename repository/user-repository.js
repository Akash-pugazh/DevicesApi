import BaseRepository from './base-repository.js';

export default new (class UserRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename);
  }

  findUsers({ isactive = true } = {}) {
    return this.find({ isactive });
  }

  findUsersByName({ name }) {
    return this.find({ name }, { isPartialFind: true });
  }

  findUserByEmailAndIsActive({ email, isactive }) {
    return this.findOne({ email, isactive });
  }

  findUserById({ id, isactive = true } = {}) {
    return this.findOne({ id, isactive });
  }

  insertUser({ name, email, password, isadmin }) {
    return this.insertOne({ name, email, password, isadmin });
  }

  deleteUserById({ id }) {
    return this.update({ isactive: false }, { id });
  }

  updatePassword({ id, password }) {
    return this.update({ password }, { id });
  }
})('users');
