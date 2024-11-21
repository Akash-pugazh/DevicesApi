import db from '../db/index.js';
import CustomError from '../util/CustomError.js';
import bcrypt from 'bcrypt';

export default class BaseRepository {
  table;
  #BASE_QUERY;
  constructor(tableName) {
    this.table = tableName;
    this.#BASE_QUERY = `SELECT * FROM ${this.table}`;
    this.computeCb = null;
    this.error = null;
    this.data = null;
  }

  setupError(error) {
    this.error = error;
    return this;
  }

  build(returnDataCb) {
    this.computeCb !== null && this.computeCb();
    returnDataCb && returnDataCb(this.data);
    return this.data;
  }

  errorThrowHelper() {
    if (this.error === null) {
      throw new CustomError({ statusCode: 500, errorMessage: 'Internal Server Error' });
    } else {
      throw this.error;
    }
  }

  setErrorCondition(additionalChecks) {
    this.computeCb = () => {
      if (additionalChecks && additionalChecks(this.data)) {
        this.errorThrowHelper();
      }
    };
    return this;
  }

  async comparePassword(password, hashedPassword) {
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    this.data = isValidPassword;
    return this;
  }

  async getAll() {
    return await this.customQuery(this.#BASE_QUERY);
  }

  async insertOne(data) {
    let resQuery = `INSERT INTO ${this.table} `;
    const cols = Object.keys(data).join(', ');
    resQuery += `(${cols}) VALUES `;

    const valStr = Object.values(data)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    resQuery += `(${valStr}) RETURNING *`;
    return await db.one(resQuery, Object.values(data));
  }

  async findOne(conditions, isMatchAll = true, isPartialFind = false) {
    let resQuery = `${this.#BASE_QUERY} WHERE `;
    Object.keys(conditions).forEach((condition, index, arr) => {
      const matchCondition = arr[index + 1] ? (isMatchAll ? 'AND' : 'OR') : '';
      resQuery += isPartialFind
        ? `${condition} ILIKE $${index + 1} ${matchCondition} `
        : `${condition} ${conditions[condition] === null ? 'IS NULL' : '='} ${conditions[condition] !== null ? `$${index + 1}` : ''} ${matchCondition} `;
    });
    const data = await this.getOneOrNull(
      resQuery,
      Object.values(conditions).filter(el => el !== null)
    );
    this.data = data;
    return this;
  }

  async find(conditions, isMatchAll = true, isPartialFind = false) {
    let resQuery = `${this.#BASE_QUERY} WHERE `;
    Object.keys(conditions).forEach((condition, index, arr) => {
      const matchCondition = arr[index + 1] ? (isMatchAll ? 'AND' : 'OR') : '';
      resQuery += isPartialFind
        ? `${condition} ILIKE $${index + 1} ${matchCondition} `
        : `${condition} = $${index + 1} ${matchCondition} `;
    });
    await this.customQuery(resQuery, Object.values(conditions));
    return this;
  }

  async update(data, conditions, isMatchAll = true) {
    let valIndex = 1;
    let updateQuery = `UPDATE ${this.table} SET `;
    Object.keys(data).forEach((key, index, arr) => {
      updateQuery += `${key} = $${valIndex++}${arr[index + 1] ? ',' : ''} `;
    });
    updateQuery += 'WHERE ';
    Object.keys(conditions).forEach((condition, index, arr) => {
      const matchCondition = arr[index + 1] ? (isMatchAll ? 'AND' : 'OR') : '';
      updateQuery += `${condition} = $${valIndex++} ${matchCondition} `;
    });
    return await this.customQuery(updateQuery, [...Object.values(data), ...Object.values(conditions)]);
  }

  async getOneOrNull(query, values = []) {
    return await db.oneOrNone(query, values);
  }

  async customQuery(query, values = []) {
    this.data = await db.query(query, values);
    return this;
  }
}
