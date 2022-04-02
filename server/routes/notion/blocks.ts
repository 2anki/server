import express from "express";
import NotionAPIWrapper from "../../lib/notion/NotionAPIWrapper";

export default async function GetBlocks(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send();
  }
  const blocks = await api.getBlocks(id, res.locals.patreon);
  res.json(blocks);
}
