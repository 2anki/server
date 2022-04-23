import DB from "../storage/db";

export default function create(id: string, owner: number) {
    return DB("favorites").insert({
        object_id: id,
        owner,
    });
}