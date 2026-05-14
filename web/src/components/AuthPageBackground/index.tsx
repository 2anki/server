import { useMemo } from 'react';
import styles from './AuthPageBackground.module.css';
import { getDailyPhoto } from './photos';

interface Props {
  children: React.ReactNode;
}

export function AuthPageBackground({ children }: Readonly<Props>) {
  const photo = useMemo(getDailyPhoto, []);
  const imgUrl = `https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=2560&q=95`;

  return (
    <div className={styles.root}>
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${imgUrl})` }}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
      <p className={styles.attribution}>
        <a
          href={`https://unsplash.com/photos/${photo.id}?utm_source=2anki&utm_medium=referral`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {photo.location}, {photo.year}
        </a>
        {' · '}
        <a
          href={`${photo.photographerUrl}?utm_source=2anki&utm_medium=referral`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {photo.photographer}
        </a>
        {' / '}
        <a
          href="https://unsplash.com/?utm_source=2anki&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
}
