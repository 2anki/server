import { Knex } from 'knex';

import UsersRepository from '../data_layer/UsersRepository';
import DB from '../lib/storage/db';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  const userRepostiory = new UsersRepository(DB);

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 21,
      name: 'Alexander Alemayhu',
      password: userRepostiory.getHashPassword('ichiban'),
      email: 'alexander@alemayhu.com',
    },
  ]);
}
