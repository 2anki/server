import { Request, Response } from "express";
import all from "../../lib/favorite/all";

export default async function getFavorites(_req: Request, res: Response) {
    const {owner} = res.locals;
    const favorites = await all(owner);
    res.json(favorites);
}