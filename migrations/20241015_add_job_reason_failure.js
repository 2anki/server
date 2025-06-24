exports.up = function (knex) {
  return knex.schema.table('jobs', function (table) {
    table.text('job_reason_failure').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('jobs', function (table) {
    table.dropColumn('job_reason_failure');
  });
};
