import { format as formatUrl } from "url";
import fs from "fs";

/* @ts-ignore */
import { patreon, oauth } from "patreon";
/* @ts-ignore */
import jsonMarkup from "json-markup";
import express from "express";

import RequireAuthentication from "../middleware/RequireAuthentication";
import TokenHandler from "../lib/misc/TokenHandler";
import DB from "../lib/storage/db";
const jsonStyles = fs.readFileSync(
  __dirname + "/../node_modules/json-markup/style.css"
);

const clientId = process.env.PATREON_CLIENT_ID;
const clientSecret = process.env.PATREON_CLIENT_SECRET;
const redirect = process.env.PATREON_CLIENT_REDIRECT;
const oauthClient = oauth(clientId, clientSecret);

const loginUrl = formatUrl({
  protocol: "https",
  host: "patreon.com",
  pathname: "/oauth2/authorize",
  query: {
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirect,
    state: "chill",
  },
});
console.log("loginUrl", loginUrl);

const router = express.Router();

router.get("/", RequireAuthentication, (req, res) => {
  res.send(`<a href="${loginUrl}">Login with Patreon</a>`);
});

router.get("/oauth/redirect", RequireAuthentication, (req, res) => {
  const { code } = req.query;
  let token: string;

  return (
    oauthClient
      .getTokens(code, redirect)
      /* @ts-ignore */
      .then(({ access_token }) => {
        token = access_token; // eslint-disable-line camelcase
        const apiClient = patreon(token);
        return apiClient("/current_user");
      })
      /* @ts-ignore */
      .then(async ({ store, rawJson }) => {
        const { id } = rawJson.data;
        await TokenHandler.SavePatreonToken(
          DB,
          res.locals.owner,
          token,
          rawJson.data
        );
        console.log(
          `Saved user ${store.find("user", id).full_name} to the database`
        );
        return res.redirect(`/protected/${id}`);
      })
      .catch((err: any) => {
        console.log(err);
        console.log("Redirecting to login");
        res.redirect("/");
      })
  );
});

/* @ts-ignore */
function oauthExampleTpl({ name, campaigns }) {
  return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>OAuth Results</title>
        <style>
            .container {
                max-width: 800px;
                margin: auto;
            }
            .jsonsample {
                max-height: 500px;
                overflow: auto;
                margin-bottom: 60px;
                border-bottom: 1px solid #ccc;
            }
        </style>
        <style>${jsonStyles}</style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome, ${name}!</h1>
            <h2>Campaigns</h2>
            <div class="jsonsample">${jsonMarkup(campaigns)}</div>
        </div>
    </body>
</html>`;
}

router.get("/protected/:id", RequireAuthentication, async (req, res) => {
  if (!res.locals.patreon) {
    return res.redirect("/");
  }

  const token = await TokenHandler.GetPatreonToken(DB, res.locals.owner);

  const apiClient = patreon(token);

  // make api requests concurrently
  return (
    apiClient("/current_user/campaigns")
      /* @ts-ignore */
      .then(({ store }) => {
        const _user = store.find("user", res.locals.owner);
        const campaign = _user.campaign
          ? _user.campaign.serialize().data
          : null;
        const page = oauthExampleTpl({
          name: _user.first_name,
          campaigns: [campaign],
        });
        return res.send(page);
      })
      .catch((err: { status: any; statusText: any }) => {
        const { status, statusText } = err;
        console.log("Failed to retrieve campaign info");
        console.log(err);
        return res.json({ status, statusText });
      })
  );
});

export default router;
