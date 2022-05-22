import { Knex } from 'knex';

import hashPassword from './hashPassword';

export default async function updatePassword(
  DB: Knex,
  password: any,
  reset_token: any,
) {
  return DB('users')
    .where({ reset_token })
    .update({ password: hashPassword(password), reset_token: null });
}
