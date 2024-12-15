import { renderToStaticMarkup } from 'react-dom/server';

export const NO_PACKAGE_ERROR = new Error(
  renderToStaticMarkup(
    <>
      <div className="info">
        Could not create a deck using your file(s) and rules. Make sure to at
        least create on valid toggle or verify your{' '}
        <a href="/upload?view=template">settings</a>? Example:
      </div>
      <div className="card" style={{ width: '50%', padding: '1rem' }}>
        <details>
          <summary>This the front</summary>
          This is the back
        </details>
      </div>
    </>
  )
);
