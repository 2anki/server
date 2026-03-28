import { renderToStaticMarkup } from 'react-dom/server';

export const getNoPackageError = (paying: boolean) =>
  new Error(
    renderToStaticMarkup(
      <>
        <div className="info">
          Could not create a deck using your file(s) and rules. Make sure to at
          least create on valid toggle or verify your{' '}
          <a href="/upload?view=template">settings</a>.<br />{' '}
          {paying ? (
            <>
              Alternatively, you can enable{' '}
              <strong>Generate Flashcards with Claude AI</strong> in your
              settings to automatically generate flashcards from your content.
            </>
          ) : (
            <>
              Upgrade to a <a href="/pricing">subscriber account</a> to unlock
              Claude AI flashcard generation for complex documents.
            </>
          )}
        </div>
      </>
    )
  );
