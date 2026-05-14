import { useMemo } from 'react';
import styles from './AuthPageBackground.module.css';
import { getDailyPhoto } from './photos';

interface Props {
  children: React.ReactNode;
}

export function AuthPageBackground({ children }: Readonly<Props>) {
  const photo = useMemo(getDailyPhoto, []);
  const imgUrl = `https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=1920&q=80`;

  return (
    <div
      className={styles.root}
      style={{ '--auth-bg': `url("${imgUrl}")` } as React.CSSProperties}
    >
      {children}
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
