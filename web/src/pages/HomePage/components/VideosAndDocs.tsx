import styles from '../../../styles/shared.module.css';

export function VideosAndDocs() {
  return (
    <>
      <p>
        Watch these short walkthroughs or read the{' '}
        <a href="/documentation/start-here/what-is-2anki">documentation</a>.
      </p>

      <h3 className={styles.sectionHeading}>
        Convert with the Notion integration
      </h3>
      <figure className={styles.videoWrapper}>
        <iframe
          src="https://www.youtube.com/embed/LqMiK2vGQ8Q?si=clbSHdVHrpwDl-9D"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </figure>

      <h3 className={styles.sectionHeading}>
        Convert with file upload
      </h3>
      <figure className={styles.videoWrapper}>
        <iframe
          src="https://www.youtube.com/embed/5ZDA79KfRi8?si=SCnTnHRwP81-ha2c"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </figure>
    </>
  );
}
