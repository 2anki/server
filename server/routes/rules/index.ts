import express from "express";

import RequireAuthentication from "../../middleware/RequireAuthentication";
import ParserRules from "../../lib/parser/ParserRules";
import DB from "../../lib/storage/db";

const router = express.Router();

router.get("/find/:id", RequireAuthentication, async (req, res) => {
  console.info(`/rules/find ${req.params.id}`);
  const id = req.params.id;
  console.log("id", id);
  if (!id) return res.status(400).send();
  await DB("parser_rules")
    .where({ object_id: id })
    .returning("*")
    .first()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send();
    });
});

router.post("/create/:id", RequireAuthentication, async (req, res) => {
  console.info(`/rules/create ${req.params.id}`);
  const id = req.params.id;
  if (!id) return res.status(400).send();
  await ParserRules.Save(id, res.locals.owner, req.body.payload);
  res.status(200).send();
});

export default router;
