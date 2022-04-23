import express from "express";

import RequireAuthentication from "../../middleware/RequireAuthentication";
import createFavorite from "./createFavorite";
import getFavorites from "./getFavorites";
import removeFavorite from "./removeFavorite";

const router = express.Router();

router.get("/create/:id", RequireAuthentication, createFavorite);
router.post("/remove/:id", RequireAuthentication, removeFavorite);
router.get("/", RequireAuthentication, getFavorites);

export default router;
