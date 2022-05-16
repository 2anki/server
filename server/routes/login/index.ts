import { Handler } from "express";
import path from "path";
import TokenHandler from "../../lib/misc/TokenHandler";

const login = function ({ distDir }: {
  distDir: string;
}): Handler {
  return async function (req, res) {
    try {
      const user = await TokenHandler.GetUserFrom(req.cookies.token);
      if (!user) {
        res.sendFile(path.join(distDir, "index.html"));
      } else {
        res.redirect("/search");
      }
    } catch (ex: unknown) {
      console.error("could not login");
    }
  }
}

export default login;

