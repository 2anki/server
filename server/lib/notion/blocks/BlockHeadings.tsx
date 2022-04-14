import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import TagRegistry from "../../parser/TagRegistry";
import BlockHandler from "../BlockHandler";
import getPlainText from "../helpers/getPlainText";
import { styleWithColors } from "../NotionColors";
import HandleBlockAnnotations, { HandleChildren } from "./utils";

export const BlockHeading1 = async (
  block: GetBlockResponse,
  handler?: BlockHandler
) => {
  /* @ts-ignore */
  const heading = block.heading_1;
  const text = heading.text;
  
  if (handler?.settings?.isTextOnlyBack) {
    return getPlainText(text);
  }

  /* @ts-ignore */
  if (block.has_children && handler) {
    return HandleChildren(block, handler);
  }

  return ReactDOMServer.renderToStaticMarkup(
    <h1 className={styleWithColors(heading.color)} id={block.id}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        TagRegistry.getInstance().addHeading(t.plain_text);
        /* @ts-ignore */
        const annotations = t.annotations;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </h1>
  );
};

export const BlockHeading2 = (
  block: GetBlockResponse,
  handler?: BlockHandler
) => {
  /* @ts-ignore */
  const heading = block.heading_2;
  const text = heading.text;
  
  if (handler?.settings?.isTextOnlyBack && text) {
    return text[0].plain_text;
  }

  /* @ts-ignore */
  if (block.has_children && handler) {
    return HandleChildren(block, handler);
  }

  return ReactDOMServer.renderToStaticMarkup(
    <h2 className={styleWithColors(heading.color)} id={block.id}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        TagRegistry.getInstance().addHeading(t.plain_text);
        /* @ts-ignore */
        const annotations = t.annotations;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </h2>
  );
};

export const BlockHeading3 = (
  block: GetBlockResponse,
  handler?: BlockHandler
) => {
  /* @ts-ignore */
  const heading = block.heading_3;
  const text = heading.text;
  
  if (handler?.settings?.isTextOnlyBack && text) {
    return text[0].plain_text;
  }

  /* @ts-ignore */
  if (block.has_children && handler) {
    return HandleChildren(block, handler);
  }

  return ReactDOMServer.renderToStaticMarkup(
    <h3 className={styleWithColors(heading.color)} id={block.id}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        TagRegistry.getInstance().addHeading(t.plain_text);
        /* @ts-ignore */
        const annotations = t.annotations;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </h3>
  );
};

export const IsTypeHeading = (block: GetBlockResponse) => {
  /* @ts-ignore */
  switch (block.type) {
    case "heading_1":
      return true;
    case "heading_2":
      return true;
    case "heading_3":
      return true;
    default:
      return false;
  }
};
