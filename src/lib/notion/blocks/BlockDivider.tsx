import ReactDOMServer from 'react-dom/server';

export const BlockDivider = () => ReactDOMServer.renderToStaticMarkup(<hr />);
