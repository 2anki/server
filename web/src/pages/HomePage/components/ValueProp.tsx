import sharedStyles from '../../../styles/shared.module.css';
import styles from './ValueProp.module.css';

const FORMATS = ['Notion', 'HTML', 'Markdown', 'PDF', 'CSV', 'Word', 'PowerPoint', 'Excel'];

const STEPS = [
  { title: 'Upload', body: 'Drop a Notion export, PDF, markdown, or any supported file.' },
  { title: 'Convert', body: '2anki builds your Anki deck — usually in a few seconds.' },
  { title: 'Download', body: 'Open the .apkg file in Anki. Your cards are ready to study.' },
];

export function ValueProp() {
  return (
    <section className={styles.section}>
      <h2 className={sharedStyles.subHeading}>What is 2anki?</h2>
      <p className={styles.intro}>
        2anki converts your study notes into Anki flashcards so you can
        focus on learning, not formatting.
      </p>

      <div className={styles.formats}>
        <h3 className={styles.formatsTitle}>Supported formats</h3>
        <ul className={styles.formatsList}>
          {FORMATS.map((format) => (
            <li key={format} className={styles.formatTag}>{format}</li>
          ))}
        </ul>
      </div>

      <h3 className={styles.formatsTitle}>How it works</h3>
      <div className={styles.steps}>
        {STEPS.map((step, idx) => (
          <div key={step.title} className={styles.step}>
            <span className={styles.stepNumber}>{idx + 1}</span>
            <p className={styles.stepTitle}>{step.title}</p>
            <p className={styles.stepBody}>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
