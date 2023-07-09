export interface NewFavorite {
  object_id: string;
  owner: string;
  type: string;
}

export const isValidFavoriteInput = (object_id: string, type: string) =>
  object_id && type;
