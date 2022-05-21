import { Request, Response } from 'express';

import ParserRules from '../../lib/parser/ParserRules';

export default async function createRule(req: Request, res: Response) {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).send();
  }
  
  await ParserRules.Save(id, res.locals.owner, req.body.payload);
  res.status(200).send();
}
