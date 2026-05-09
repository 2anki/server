exports.up = function (knex) {
  return knex.schema.alterTable(
    'ankify_notion_subscriptions',
    function (table) {
      table.text('notion_page_icon').nullable();
    }
  );
};

exports.down = function (knex) {
  return knex.schema.alterTable(
    'ankify_notion_subscriptions',
    function (table) {
      table.dropColumn('notion_page_icon');
    }
  );
};
