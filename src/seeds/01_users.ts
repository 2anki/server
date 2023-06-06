import { Knex } from 'knex';

import TokenRepository from '../data_layer/TokenRepository';
import UsersRepository from '../data_layer/UsersRepository';
import AuthenticationService from '../services/AuthenticationService';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  const userRepostiory = new UsersRepository(knex);
  const auth = new AuthenticationService(
    new TokenRepository(knex),
    userRepostiory
  );

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 21,
      name: 'Alexander Alemayhu',
      password: auth.getHashPassword('ichiban'),
      email: 'alexander@alemayhu.com',
    },
  ]);
}
