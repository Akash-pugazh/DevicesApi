import pgPromise from 'pg-promise';

const pgpDbInstanceCreator = pgPromise({
  pgFormatting: true,
  capSQL: true
});

export default pgpDbInstanceCreator('postgres://aakash:password@localhost:5432/taskDb');
