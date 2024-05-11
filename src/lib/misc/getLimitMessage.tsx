import { renderToStaticMarkup } from 'react-dom/server';

export const getLimitMessage = () =>
  renderToStaticMarkup(
    <div className="content">
      <h3 className="title is-3">Your request has hit the limit</h3>
      <ul>
        <li>
          Split your request into multiple smaller ones (i.e.) make your upload
          size smaller.
        </li>
        <li>
          <div className="is-flex is-align-items-center">
            <a
              className="button is-success is-medium mr-2"
              href="https://buy.stripe.com/eVadTGcCI6Ny73qfZ0"
            >
              Subscribe
            </a>{' '}
            for only 2 EUR per month to remove all the limits.
          </div>
        </li>
        <li>
          Or <a href="https://alemayhu.com/patreon">Become a patron</a> to
          support me.
        </li>
      </ul>
      <p>
        If you already have an account, please{' '}
        <a href="/login?redirect=/upload">login</a> and try again. If you are
        still experiencing issues, please contact{' '}
        <a href="mailto:alexander@alemayhu.com">alexander@alemayhu.com</a>.
      </p>
    </div>
  );
