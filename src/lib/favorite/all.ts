import DB from '../storage/db';

export default function all(owner: number) {
  return DB('favorites').select('*').where({
    owner,
  });
}
