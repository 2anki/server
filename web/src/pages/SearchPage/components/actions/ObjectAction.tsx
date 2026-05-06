import { MouseEventHandler } from 'react';
import styles from '../SearchObjectEntry/SearchObjectEntry.module.css';

export interface ObjectActionProps {
  url: string;
  image: string;
  label: string;
  onClick?: MouseEventHandler;
  disabled?: boolean;
}

export default function ObjectAction({
  url,
  image,
  label,
  onClick,
  disabled = false,
}: Readonly<ObjectActionProps>) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      aria-label={label}
      title={label}
      aria-disabled={disabled || undefined}
      className={disabled ? styles.actionDisabled : undefined}
    >
      <img
        className={styles.objectIconAction}
        alt=""
        width="32"
        src={image}
      />
    </a>
  );
}
