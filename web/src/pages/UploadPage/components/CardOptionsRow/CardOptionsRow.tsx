import { Link } from 'react-router-dom';
import SettingsIcon from '../../../../components/icons/SettingsIcon';
import { getVisibleText } from '../../../../lib/text/getVisibleText';
import styles from './CardOptionsRow.module.css';

interface Props {
  onOpen: () => void;
}

function CardOptionsRow({ onOpen }: Readonly<Props>) {
  return (
    <div className={styles.wrapper}>
      <Link
        to="?view=template"
        className={styles.row}
        onClick={onOpen}
        aria-label="Card and deck options"
      >
        <span className={styles.left}>
          <span className={styles.icon}>
            <SettingsIcon />
          </span>
          <span className={styles.label}>{getVisibleText('card.options')}</span>
          <span className={styles.summary}>Using defaults</span>
        </span>
        <span className={styles.action}>Change</span>
      </Link>
    </div>
  );
}

export default CardOptionsRow;
