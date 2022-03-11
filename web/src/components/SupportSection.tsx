import BecomeAPatron from './BecomeAPatron';

function SupportSection() {
  return (
    <div className="mb-2">
      <h3 className="title is-3"> Support The Development 🙏🏾</h3>
      <p>
        This web server is community funded by our amazing
        {' '}
        <span> </span>
        <a href="https://www.patreon.com/alemayhu">patrons</a>
        {' '}
        and
        {' '}
        <a href="https://github.com/sponsors/alemayhu">sponsors</a>
        🤩 👏🏾
      </p>
      <br />
      {' '}
      While
      <u>not required,</u>
      {' '}
      you can directly support the development
      and accelerate the improvements!
      <div className="has-text-centered my-2">
        <BecomeAPatron />
      </div>
      <div>
        <p>
          Not comfortable with reocurring expense? No worries, you can send
          one-time contributions with
          {' '}
          <a href="https://ko-fi.com/alemayhu">Ko-Fi</a>
          .
        </p>
        <div className="has-text-centered">
          <a rel="noreferrer" href="https://ko-fi.com/W7W6QZNY" target="_blank">
            <img
              height="51"
              style={{ border: '0px', height: '51px' }}
              src="https://cdn.ko-fi.com/cdn/kofi1.png?v=2"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default SupportSection;
