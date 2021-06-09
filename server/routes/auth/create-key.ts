import express from "express";
import router from "../checks";

const base64 = require("base-64");
const fetch = require("node-fetch");

const clientId = process.env.NOTION_CLIENT_ID;
const clientSecret = process.env.NOTION_CLIENT_SECRET;

async function postData(url = "", data = {}) {
  // @ts-ignore
  const response = await fetch(url, {
    method: "POST",
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
  console.log("response", response);
  return response.json(); // parses JSON response into native JavaScript objects
}

router.post("create-key", (req, res) => {
  const code = req.headers.code;
  if (!code) {
    return res.status(401).send("Missing code header");
  }
  const redirectUri = process.env.NOTION_REDIRECT_URI;
  postData("https://api.notion.com/v1/oauth/token", {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
  }).then((data) => res.json(data));
});

export default router;
