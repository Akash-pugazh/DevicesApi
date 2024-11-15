import pgPromise from 'pg-promise';

const pgpDbInstanceCreator = pgPromise({
  pgFormatting: true,
  capSQL: true
});

const db = pgpDbInstanceCreator('postgres://aakash:password@localhost:5432/taskDb');

export default db;
