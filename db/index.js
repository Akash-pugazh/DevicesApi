import pg from 'pg'

export default new pg.Pool({
  user: 'aakash',
  host: 'localhost',
  database: 'taskDb',
  port: 5432,
})
