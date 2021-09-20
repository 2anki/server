import knex from "knex";

const DB = knex({
  client: "pg",
  connection:
    process.env.PG_CONNECTION_STRING || "postgresql://localhost:5432/n",
});

export default DB;