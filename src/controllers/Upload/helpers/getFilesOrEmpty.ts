import { ParamsDictionary } from 'express-serve-static-core';

export function getFilesOrEmpty<T>(body: ParamsDictionary): T[] {
  if (body === undefined || body === null) {
    return [];
  }
  return body.files ? JSON.parse(body.files) : [];
}
