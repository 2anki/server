import { Request, Response } from "express";

import ConversionJob from "../../lib/jobs/ConversionJob";
import DB from "../../lib/storage/db";

export default async function deleteJob(req: Request, res: Response) {
  console.log("delete job", req.params.id);
  try {
    let c = new ConversionJob(DB);
    await c.completed(req.params.id, res.locals.owner);
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
    console.error(err);
  }
}
