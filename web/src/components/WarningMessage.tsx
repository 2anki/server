import React from 'react';

function WarningMessage() {
  return (
    <section
      className="hero is-small is-warning"
      style={{ marginBottom: '1rem' }}
    >
      <div className="hero-body has-text-centered">
        <p className="title">This is a development server</p>
        <p>
          For the production version see
          <a className="button" href="https://2anki.net">
            https://2anki.net
          </a>
        </p>
        <p>When reporting bugs, please make sure to share examples</p>
      </div>
    </section>
  );
}

export default WarningMessage;
