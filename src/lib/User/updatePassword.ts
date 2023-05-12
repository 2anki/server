import { Knex } from 'knex';

import hashPassword from './hashPassword';

export default function updatePassword(
  DB: Knex,
  password: string,
  reset_token: string
) {
  return DB('users')
    .where({ reset_token })
    .update({ password: hashPassword(password), reset_token: null });
}
