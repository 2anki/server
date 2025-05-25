module.exports.up = async function (knex) {
  return knex.schema.table('users', function (table) {
    table.timestamp('first_week_email_sent_at').nullable();
  });
};

module.exports.down = async function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('first_week_email_sent_at');
  });
};
