import { renderToStaticMarkup } from 'react-dom/server';

export const getLimitMessage = () =>
  renderToStaticMarkup(
    <>
      <strong>
        Your request has hit the limit, there is a max to prevent abuse. You
        have two options:
      </strong>
      <ul>
        <li>
          Split your request into multiple smaller ones (i.e.) make your upload
          size smaller.
        </li>
        <li>
          <a href="https://alemayhu.com/patreon">Become a patron</a> to remove
          the limit or <a href="/login?redirect=/upload">login</a> if you
          already have an account.
        </li>
      </ul>
    </>
  );
