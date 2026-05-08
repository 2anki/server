exports.up = function (knex) {
  return knex.schema.alterTable(
    'ankify_notion_subscriptions',
    function (table) {
      table.text('notion_page_title').nullable();
      table.text('notion_page_url').nullable();
    }
  );
};

exports.down = function (knex) {
  return knex.schema.alterTable(
    'ankify_notion_subscriptions',
    function (table) {
      table.dropColumn('notion_page_title');
      table.dropColumn('notion_page_url');
    }
  );
};
