import { useEffect, useState } from "react";

const connectLink = () => {
  const redirectUri = encodeURIComponent("https://2anki.net/connect-notion");
  const notionClientID = "384c361a-dc51-4960-abc1-b1e76665f8da";
  return `https://api.notion.com/v1/oauth/authorize?client_id=${notionClientID}&redirect_uri=${redirectUri}&response_type=code`;
};

const NotionConnectPage = () => {
  const [accessToken, setToken] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    let url = new URL(window.location.href);
    const codeParam = url.searchParams.get("code");
    if (codeParam) {
      localStorage.setItem("code", codeParam);
      localStorage.setItem("state", url.searchParams.get("state") || "");
    }
    setCode(localStorage.getItem("code") || "");
    setToken(localStorage.getItem("access_token") || "");
  }, []);

  const getNotionKey = () => {
    console.log("to be implemented");
    fetch("/auth/create-key", {
      headers: { code: code },
    }).then((response) => {
      response.json().then((payload) => {
        console.log(payload);
        for (const [key, value] of Object.entries(payload)) {
          // @ts-ignore
          localStorage.setItem(key, value);
          if (key === "access_token") {
            // @ts-ignore
            setToken(value);
          }
        }
      });
    });
  };

  return (
    <>
      {!code && <a href={connectLink()}>Add to Notion</a>}
      {code && !accessToken && (
        <button onClick={() => getNotionKey()}>Get Notion Key</button>
      )}
      {code && accessToken && <p>Nothing to see here yet, move along ;-)</p>}
    </>
  );
};

export default NotionConnectPage;
