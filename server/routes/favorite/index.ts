import express from "express";

import RequireAuthentication from "../../middleware/RequireAuthentication";
import addFavorite from "./addFavorite";
import getFavorites from "./getFavorites";
import deleteFavorite from "./deleteFavorite";

const router = express.Router();

router.post("/create", RequireAuthentication, addFavorite);
router.post("/remove", RequireAuthentication, deleteFavorite);
router.get("/", RequireAuthentication, getFavorites);

export default router;
