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

  reset() {
    this.error = null;
    this.data = null;
    this.computeCb = null;
  }

  build(returnDataCb) {
    this.computeCb !== null && this.computeCb();
    returnDataCb && returnDataCb(this.data);
    setTimeout(() => this.reset());
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

  async getAll() {
    await this.customQuery(this.#BASE_QUERY);
    return this;
  }

  async insertOne(data) {
    let resQuery = `INSERT INTO ${this.table} `;
    const cols = Object.keys(data).join(', ');
    resQuery += `(${cols}) VALUES `;

    const valStr = Object.values(data)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    resQuery += `(${valStr}) RETURNING *`;
    this.data = await db.one(resQuery, Object.values(data));
    return this;
  }

  async findOne(conditions, isMatchAll = true, isPartialFind = false) {
    let resQuery = `${this.#BASE_QUERY} WHERE `;
    Object.keys(conditions).forEach((condition, index, arr) => {
      const matchCondition = arr[index + 1] ? (isMatchAll ? 'AND' : 'OR') : '';
      resQuery += isPartialFind
        ? `${condition} ILIKE $${index + 1} ${matchCondition} `
        : `${condition} ${conditions[condition] === null ? 'IS NULL' : '='} ${conditions[condition] !== null ? `$${index + 1}` : ''} ${matchCondition} `;
    });
    const data = (
      await this.getOneOrNull(
        resQuery,
        Object.values(conditions).filter(el => el !== null)
      )
    ).build();
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
    await this.customQuery(updateQuery, [...Object.values(data), ...Object.values(conditions)]);
    return this;
  }

  async getOneOrNull(query, values = []) {
    this.data = await db.oneOrNone(query, values);
    return this;
  }

  async customQuery(query, values = []) {
    this.data = await db.query(query, values);
    return this;
  }
}
