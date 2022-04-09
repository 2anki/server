import { GetBlockResponse } from "@notionhq/client/build/src/api-endpoints";
import ReactDOMServer from "react-dom/server";
import { styleWithColors } from "../../NotionColors";
import HandleBlockAnnotations from "../utils";

export const BlockTodoList = (block: GetBlockResponse) => {
  /* @ts-ignore */
  const todo = block.to_do;
  const text = todo.text;

  return ReactDOMServer.renderToStaticMarkup(
    <ul id={block.id} className={`to-do-list${styleWithColors(todo.color)}`}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        const annotations = t.annotations;
        /* @ts-ignore */
        return (
          <li>
            <div
              /* @ts-ignore */
              className={`checkbox checkbox-${t.checked ? "on" : "off"}`}
            ></div>
            {/* @ts-ignore */}
            {HandleBlockAnnotations(annotations, t.text)}
          </li>
        );
      })}
    </ul>
  );
};
