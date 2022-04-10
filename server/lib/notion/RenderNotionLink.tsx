import ReactDOMServer from "react-dom/server";

const RenderNotionLink = (link: string): string | null => {
  return ReactDOMServer.renderToStaticMarkup(
    <div style={{ textAlign: "center" }}>
      <a style={{ textDecoration: "none", color: "grey" }} href={link}>
        Open in Notion
      </a>
    </div>
  );
};

export default RenderNotionLink;
