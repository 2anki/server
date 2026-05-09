export interface AnkifyAccessUser {
  patreon: boolean | null;
}

export const hasAnkifyAccess = (
  user: AnkifyAccessUser | null | undefined
): boolean => user != null && user.patreon === true;
