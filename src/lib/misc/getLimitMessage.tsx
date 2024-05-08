import { renderToStaticMarkup } from 'react-dom/server';

export const getLimitMessage = () =>
  renderToStaticMarkup(
    <div className="content">
      <h3 className="title is-3">Your request has hit the limit</h3>
      <p>You have two options:</p>
      <ul>
        <li>
          Split your request into multiple smaller ones (i.e.) make your upload
          size smaller.
        </li>
        <li>
          <a href="https://alemayhu.com/patreon">Become a patron</a> to remove
          all the limits or{' '}
          <a href="https://buy.stripe.com/eVadTGcCI6Ny73qfZ0">subscribe</a> for
          only 2 EUR per month.
          <p>
            If you already have an account, please{' '}
            <a href="/login?redirect=/upload">login</a> and try again.
          </p>
        </li>
      </ul>
    </div>
  );
