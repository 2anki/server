import express from "express";
import NotionAPIWrapper from "../../lib/notion/NotionAPIWrapper";
import NotionID from "../../lib/notion/NotionID";

export default async function GetDatabase(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).send();
    }
    id = id.replace(/-/g, "");
    if (id.includes("/")) {
      id = NotionID.fromString(req.params.id);
    }
    const database = await api.getDatabase(id);
    console.log("database", database);
    res.json(database);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
}

export async function QueryDatabase(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send();
  }
  const results = await api.queryDatabase(id);
  res.json(results);
}
