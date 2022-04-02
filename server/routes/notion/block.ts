import express from "express";
import NotionAPIWrapper from "../../lib/notion/NotionAPIWrapper";

export default async function GetBlock(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send();
  }
  const block = await api.getBlock(id);
  res.json(block);
}
