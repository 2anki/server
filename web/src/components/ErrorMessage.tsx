const MyLink = () => (
  <a href="https://alemayhu.com" target="_blank" rel="noreferrer">
    Alexander
  </a>
);
const ErrorMessage: React.FC<{ msg: string }> = ({ msg }) => {
  const isCorruptZip = msg.includes('Corrupted zip');
  const fileSizeIssue = msg.includes('100MB');
  return (
    <section className="hero">
      {isCorruptZip && (
        <div className="hero p-4">
          <p className="subtitle">
            Your HTML file upload is invalid. Please try exporting it again in
            Notion and waiting for it to finish the export before uploading.
          </p>
          <p className="subtitle">
            If you have very long sub page names, try exporting one at a time
            for upload.
          </p>
          <p className="subtitle">
            The problem is that Notion is exporting bad zip files sometimes. You
            can report this issue to them{' '}
            <a
              rel="noreferrer"
              target="_blank"
              className="tag"
              href="https://www.notion.so/I-found-a-bug-What-should-I-do-b3367fd78c2e4ca6a263dd2730fea422"
            >
              here
            </a>
            .
          </p>
          <hr />
          <p className="subtitle is-6">
            <MyLink /> is working on the new version using the Notion API.
            Coming soon.
          </p>
        </div>
      )}
      {fileSizeIssue && (
        <div className="hero p-4">
          <div dangerouslySetInnerHTML={{ __html: msg }}></div>
          <p className="subtitle">
            Please upload smaller pages or If you have big sub pages, try
            exporting one at a time for upload.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a href="/upload" className="button is-small">
              Try Again
            </a>
          </div>
          <hr />
          <p
            className="subtitle is-6"
            style={{ display: 'flex', alignItems: 'center', gridGap: '0.1rem' }}
          >
            <MyLink />
            is working on the new version using the Notion API
            <span className="mx-2 tag is-info">Coming soon</span>
          </p>
        </div>
      )}

      {!isCorruptZip && !fileSizeIssue && (
        <>
          <div dangerouslySetInnerHTML={{ __html: msg }}></div>
          <p className="subtitle">
            Watch the video below and see if you are experiencing a common error
            or read the error message.
          </p>
          <div className="has-text-centered">
            <iframe
              title="x"
              style={{ width: '560px', height: '315px' }}
              src="https://www.youtube.com/embed/CaND1Y3X6og"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen={true}
            />
            <p>
              If you still haven't resolved the issue yet after trying the above
              mentioned then reach out to
            </p>
            <MyLink />
          </div>
          <div>
            <a href="/upload" className="button is-small">
              Try Again
            </a>
          </div>
        </>
      )}
    </section>
  );
};

export default ErrorMessage;
