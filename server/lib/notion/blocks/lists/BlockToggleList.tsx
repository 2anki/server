import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import BlockHandler from "../../BlockHandler";
import { styleWithColors } from "../../NotionColors";
import HandleBlockAnnotations, { HandleChildren } from "../utils";

export async function BlockToggleList(
  block: GetBlockResponse,
  handler: BlockHandler
) {
  /* @ts-ignore */
  const list = block.toggle;
  const text = list.text;
  const backSide = await HandleChildren(block, handler);
  /**
   * We can't just set open to false that won't work since it's a boolean and will be truthy.
   * The open attribute has to be omitted.
   */
  /* @ts-ignore */
  const Details = ({ children }) =>
    handler.settings?.toggleMode === "open_toggle" ? (
      <details open>{children}</details>
    ) : (
      <details>{children}</details>
    );

  return ReactDOMServer.renderToStaticMarkup(
    <>
      <ul id={block.id} className={`toggle${styleWithColors(list.color)}`}>
        <li>
          <Details>
            <summary>
              {text.map((t: GetBlockResponse) => {
                /* @ts-ignore */
                const annotations = t.annotations;
                /* @ts-ignore */
                return HandleBlockAnnotations(annotations, t.text);
              })}
            </summary>
            <div dangerouslySetInnerHTML={{ __html: backSide }} />
          </Details>
        </li>
      </ul>
    </>
  );
}
