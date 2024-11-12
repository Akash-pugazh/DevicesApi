import db from '../db/index.js'

export default class BaseRepository {
  #table
  #BASE_QUERY
  constructor(tableName) {
    this.#table = tableName
    this.#BASE_QUERY = `SELECT * FROM ${this.#table}`
  }

  async getAll() {
    return await db.query(this.#BASE_QUERY)
  }

  async insertOne(data) {
    let resQuery = `INSERT INTO ${this.#table} `
    const cols = Object.keys(data).join(', ')
    resQuery += `(${cols}) VALUES `

    const valStr = Object.values(data)
      .map((_, index) => `$${index + 1}`)
      .join(', ')
    resQuery += `(${valStr}) RETURNING *`

    return await this.customQuery(resQuery, Object.values(data))
  }

  async find(conditions, isMatchAll = true, isPartialFind = false) {
    let resQuery = `${this.#BASE_QUERY} WHERE `
    Object.keys(conditions).forEach((condition, index, arr) => {
      const matchCondition = arr[index + 1] ? (isMatchAll ? 'AND' : 'OR') : ''
      resQuery += isPartialFind
        ? `${condition} ILIKE $${index + 1} ${matchCondition} `
        : `${condition} = $${index + 1} ${matchCondition} `
    })
    return await this.customQuery(resQuery, Object.values(conditions))
  }

  async update(data, conditions, isMatchAll = true) {
    let valIndex = 1
    let updateQuery = `UPDATE ${this.#table} SET `
    Object.keys(data).forEach((key, index, arr) => {
      updateQuery += `${key} = $${valIndex++}${arr[index + 1] ? ',' : ''} `
    })
    updateQuery += 'WHERE '
    Object.keys(conditions).forEach((condition, index, arr) => {
      const matchCondition = arr[index + 1] ? (isMatchAll ? 'AND' : 'OR') : ''
      updateQuery += `${condition} = $${valIndex++} ${matchCondition} `
    })
    return await this.customQuery(updateQuery, [
      ...Object.values(data),
      ...Object.values(conditions),
    ])
  }

  async customQuery(query, values = []) {
    return await db.query(query, values)
  }
}
