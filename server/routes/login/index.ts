import { Handler } from "express";
import { INDEX_FILE } from "./lib/constants";
import TokenHandler from "../../lib/misc/TokenHandler";

const login = function (): Handler {
  return async function (req, res) {
    try {
      const user = await TokenHandler.GetUserFrom(req.cookies.token);
      if (!user) {
        res.sendFile(INDEX_FILE);
      } else {
        res.redirect("/search");
      }
    } catch (ex: unknown) {
      console.error("could not login");
    }
  }
}

export default login;

