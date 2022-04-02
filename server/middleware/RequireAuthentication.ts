import express from "express";

import TokenHandler from "../lib/misc/TokenHandler";

const RequireAuthentication = async (
  req: { cookies: { token: string } },
  res: express.Response,
  next: () => any
) => {
  const user = await TokenHandler.GetUserFrom(req.cookies.token);
  console.debug(`RequreAuthentication`);
  if (!user) {
    return res.redirect("/login#login");
  } else {
    res.locals.owner = user.owner;
    res.locals.patreon = user.patreon;
    return next();
  }
};

export default RequireAuthentication;
