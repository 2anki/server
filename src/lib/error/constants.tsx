import { renderToStaticMarkup } from 'react-dom/server';

export const NO_PACKAGE_ERROR = new Error(
  renderToStaticMarkup(
    <>
      <div className="info">
        Could not create a deck using your file(s) and rules. Make sure to at
        least create on valid toggle or verify your{' '}
        <a href="/upload?view=template">settings</a>.<br /> Alternatively, you
        can try to convert your file(s) using{' '}
        <a href={'https://custom-format.2anki.net/custom-format'}>
          2anki custom format
        </a>
        .
      </div>
    </>
  )
);
