import { REDIRECT_URI } from "../../constants";

const clientId = process.env.NOTION_CLIENT_ID;
const clientSecret = process.env.NOTION_CLIENT_SECRET;

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    /* @ts-ignore */
    mode: "no-cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + base64.encode(clientId + ":" + clientSecret),
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

import express from "express";
import base64 from "base-64";
import fetch from "node-fetch";

const router = express.Router();

router.get("/connect-notion", async (req, res) => {
  let code = req.param("code");
  if (!code) {
    return res
      .status(401)
      .send("Bad request! Missing code in the URL parameters.");
  }
  const data = await postData("https://api.notion.com/v1/oauth/token", {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
  });
  res.json({ body: data });
});

export default router;
