import { FormEvent, useRef, useState } from 'react';

import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import styles from '../../styles/shared.module.css';
import contactStyles from './ContactPage.module.css';

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<FormStatus>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    status !== 'sending' &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('sending');
    try {
      await get2ankiApi().contactUs(name, email, message, files);
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeaderCenter}>
        <h1 className={styles.title}>Get in touch</h1>
        <p className={styles.subtitle}>
          Have a question, idea, or just want to say hi? We'd love to hear from
          you.
        </p>
      </header>

      <div className={contactStyles.layout}>
        <section className={styles.surface}>
          <h2 className={styles.surfaceTitle}>Send us a message</h2>
          <p className={contactStyles.formLead}>
            We typically reply within 24–48 hours.
          </p>

          {status === 'sent' && (
            <div className={styles.alertSuccess}>
              Thanks for reaching out — we'll get back to you soon.
            </div>
          )}
          {status === 'error' && (
            <div className={styles.alertDanger}>
              Something went wrong. Please try emailing us directly at{' '}
              <a href="mailto:support@2anki.net">support@2anki.net</a>.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind…"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-files">
                Attachments{' '}
                <span className={contactStyles.optional}>(optional)</span>
              </label>
              <input
                ref={fileInputRef}
                id="contact-files"
                type="file"
                multiple
                onChange={handleFileChange}
                className={contactStyles.fileInput}
              />
              {files.length > 0 && (
                <ul className={contactStyles.fileList}>
                  {files.map((f, i) => (
                    <li key={f.name} className={contactStyles.fileItem}>
                      <span className={contactStyles.fileName}>{f.name}</span>
                      <button
                        type="button"
                        className={contactStyles.fileRemove}
                        onClick={() => removeFile(i)}
                        aria-label={`Remove ${f.name}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={!canSubmit}
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </section>

        <aside className={contactStyles.sidebar}>
          <div className={styles.surface}>
            <h3 className={styles.sectionTitle}>Email us directly</h3>
            <p className={contactStyles.cardText}>
              Prefer email? Reach us at{' '}
              <a href="mailto:support@2anki.net">support@2anki.net</a>. To help
              us resolve things faster, include:
            </p>
            <ul className={contactStyles.tipList}>
              <li>A brief description of your question or issue</li>
              <li>Steps to reproduce the problem (if technical)</li>
              <li>Any screenshots or error messages</li>
            </ul>
          </div>

          <div className={styles.surface}>
            <h3 className={styles.sectionTitle}>Share your workflow</h3>
            <p className={contactStyles.cardText}>
              Made a video or tutorial about how you use 2anki? Send it to{' '}
              <a href="mailto:support@2anki.net">support@2anki.net</a> and we'll
              feature it on the homepage. We already showcase walkthroughs in
              English, German, French, and Spanish — any language is welcome.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
