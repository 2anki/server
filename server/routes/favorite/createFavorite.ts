import { Request, Response } from "express";

import create from "../../lib/favorite/create";

export default async function createFavorite(req: Request, res: Response) {
    const {id} = req.params;
    if (!id) {
        return res.status(400).send();
    }
    const {owner} = res.locals;
    await create(id, owner);
}