exports.up = async function (knex) {
  const users = await knex('users').whereNull('picture');

  for (const user of users) {
    const picture = `https://2anki.net/blue-square.png`;
    await knex('users')
      .where('id', user.id)
      .update({ picture });
  }
};

exports.down = async function (knex) {
  await knex('users')
    .whereNotNull('picture')
    .update({ picture: null });
};
