import { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection:
    process.env.DATABASE_URL || "postgresql://aa:focaccia@localhost:5432/n",
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: process.env.MIGRATIONS_DIR || "migrations",
  },
};

export default config;
