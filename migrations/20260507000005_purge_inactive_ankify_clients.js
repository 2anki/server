exports.up = function (knex) {
  return knex('ankify_clients').where({ status: 'inactive' }).delete();
};

exports.down = function () {
  return Promise.resolve();
};
