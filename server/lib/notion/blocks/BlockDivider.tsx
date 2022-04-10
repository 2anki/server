import ReactDOMServer from "react-dom/server";

export const BlockDivider = () => {
  return ReactDOMServer.renderToStaticMarkup(<hr />);
};
