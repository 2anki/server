const CryptoJS = require('crypto-js');

function unHashToken(token) {
  return CryptoJS.AES.decrypt(token, process.env.THE_HASHING_SECRET).toString(
    CryptoJS.enc.Utf8
  );
}

function hashToken(token) {
  return CryptoJS.AES.encrypt(token, process.env.THE_HASHING_SECRET).toString();
}

module.exports.up = (knex) => {
  return knex
    .select()
    .from('notion_tokens')
    .then((users) => {
      return knex.transaction((trx) => {
        return knex.schema
          .table('notion_tokens', () =>
            Promise.all(
              users.map((row) => {
                return knex('notion_tokens')
                  .update({ token: hashToken(row.token), encrypted: true })
                  .where({ owner: row.owner, encrypted: false })
                  .transacting(trx);
              })
            )
          )
          .then(trx.commit)
          .catch(trx.rollback);
      });
    });
};

module.exports.down = (knex) => {
  return knex
    .select()
    .from('notion_tokens')
    .then((users) => {
      return knex.transaction((trx) => {
        return knex.schema
          .table('notion_tokens', () =>
            Promise.all(
              users.map((row) => {
                return knex('notion_tokens')
                  .update({ token: unHashToken(row.token), encrypted: false })
                  .where({ owner: row.owner, encrypted: true })
                  .transacting(trx);
              })
            )
          )
          .then(trx.commit)
          .catch(trx.rollback);
      });
    });
};
