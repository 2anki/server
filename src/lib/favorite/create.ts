import DB from '../storage/db';

export default function create(id: string, owner: number, type: string) {
  return DB('favorites').insert({
    object_id: id,
    type,
    owner,
  });
}
