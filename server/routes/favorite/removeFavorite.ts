import { Request, Response } from "express";

import remove from "../../lib/favorite/remove";

export default async function removeFavorite(req: Request, res: Response) {
    const {id} = req.params;
    if (!id) {
        return res.status(400).send();
    }
    const {owner} = res.locals;
    await remove(id, owner);
    res.status(200).send();
}