function BetaMessage() {
  return (
    <div
      style={{ margin: '1rem auto' }}
      className="notification is-info column is-light"
    >
      <p className="is-size-7">
        The Notion API integration is still under development. Thank you for being
        patient! Please send issues and ideas to
        {' '}
        <a href="mailto:alexander@alemayhu.com">alexander@alemayhu.com</a>
        .
      </p>
    </div>
  );
}

export default BetaMessage;
