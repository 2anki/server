import knex from 'knex';

const DB = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://localhost:5432/n',
});

export default DB;
