module.exports.up = (knex) => {
  return knex.schema.raw(
    'ALTER TABLE uploads ALTER COLUMN filename TYPE text;'
  );
};

module.exports.down = (knex) => {
  return knex.schema.raw(
    'ALTER TABLE uploads ALTER COLUMN filename TYPE varchar(255);'
  );
};
