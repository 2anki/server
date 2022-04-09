import express from "express";

import RequireAuthentication from "../../middleware/RequireAuthentication";
import createSetting from "./createSetting";
import deleteSetting from "./deleteSetting";
import findSetting from "./findSetting";

const router = express.Router();

router.post("/create/:id", RequireAuthentication, createSetting);
router.post("/delete/:id", RequireAuthentication, deleteSetting);
router.get("/find/:id", RequireAuthentication, findSetting);

export default router;
