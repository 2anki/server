const ErrorMessage: React.FC<{ msg: string }> = ({ msg }) => {
  return (
    <section className="hero is-danger">
      <div dangerouslySetInnerHTML={{ __html: msg }}></div>
      <p className="subtitle">
        Watch the video below and see if you are experiencing a common error or
        read the error message.
      </p>
      <div className="has-text-centered">
        <iframe
          title="x"
          style={{ width: "560px", height: "315px" }}
          src="https://www.youtube.com/embed/CaND1Y3X6og"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen={true}
        />
        <p>
          "If you still haven't resolved the issue yet after trying the above
          mentioned then join the server to report your issue"
        </p>
        <a
          className="button"
          rel="noreferrer"
          target="_blank"
          href="https://discord.gg/PSKC3uS"
        >
          <span>Discord</span>
        </a>
      </div>
    </section>
  );
};

export default ErrorMessage;
