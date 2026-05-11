import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import UploadForm from '../UploadPage/components/UploadForm/UploadForm';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { persistSignupOrigin } from '../../lib/signupOrigin';
import sharedStyles from '../../styles/shared.module.css';
import styles from './LandingPage.module.css';
import type { LandingCopy } from './types';

interface LandingPageProps {
  copy: LandingCopy;
  setErrorMessage: ErrorHandlerType;
}

const STEPS = [
  {
    title: 'Paste or drop your file.',
    body: 'Notion link, PDF, Word, Markdown, or a Quizlet export.',
  },
  {
    title: 'We make the deck.',
    body: 'Usually a few seconds. Bigger files take a minute.',
  },
  {
    title: 'Open it in Anki.',
    body: 'Double-click the .apkg we send back. Your cards are ready to study.',
  },
];

const FILE_TYPES_SENTENCE =
  'Works with Notion pages, PDF, Word (.docx), Markdown (.md), HTML, CSV, and Quizlet exports.';

const FOOTER_CTA_TEXT = 'Ready to try it?';
const FOOTER_CTA_LINK_TEXT = 'Drop a file at the top of this page.';

function LandingPage({ copy, setErrorMessage }: Readonly<LandingPageProps>) {
  useEffect(() => {
    persistSignupOrigin(copy.pathname, globalThis.sessionStorage ?? null);
  }, [copy.pathname]);

  const canonical = `https://2anki.net${copy.pathname}`;
  const registerHref = `/register?source=${encodeURIComponent(copy.pathname)}`;

  return (
    <div className={styles.landing}>
      <Helmet>
        <title>{copy.title}</title>
        <meta name="description" content={copy.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={copy.title} />
        <meta property="og:description" content={copy.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={copy.title} />
        <meta name="twitter:description" content={copy.description} />
      </Helmet>

      <section id="upload" className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{copy.h1}</h1>
          <p className={styles.heroSubhead}>{copy.subhead}</p>
          <div className={styles.uploadWrapper}>
            <UploadForm setErrorMessage={setErrorMessage} />
          </div>
          <p className={styles.secondaryLink}>
            or <a href={registerHref}>sign up free</a>
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>How it works</h2>
        <div className={sharedStyles.columns3}>
          {STEPS.map((step, idx) => (
            <div key={step.title} className={sharedStyles.sectionCard}>
              <p className={styles.stepNumber}>{idx + 1}</p>
              <p className={styles.stepTitle}>{step.title}</p>
              <p className={styles.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.filesSentence}>
          {FILE_TYPES_SENTENCE}{' '}
          <a href="/documentation/reference/file-formats">
            See the full list.
          </a>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Common questions</h2>
        <div className={styles.faqList}>
          {copy.faqs.map((faq) => (
            <details key={faq.q} className={styles.faqItem}>
              <summary className={styles.faqSummary}>{faq.q}</summary>
              <p className={styles.faqAnswer}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.footerCta}>
        <p className={styles.footerCtaText}>
          {FOOTER_CTA_TEXT}{' '}
          <a href="#upload" className={styles.footerCtaLink}>
            {FOOTER_CTA_LINK_TEXT}
          </a>
        </p>
      </section>
    </div>
  );
}

export default LandingPage;
