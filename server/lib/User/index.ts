import { Knex } from "knex";

class User {
  owner: string;
  patreon?: boolean;

  constructor(owner: string) {
    this.owner = owner;
  }
}

export default User;
