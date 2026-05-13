import { useEffect, useState } from 'react';

import { ContactMessage } from '../../lib/backend/Backend';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import sharedStyles from '../../styles/shared.module.css';
import styles from './OpsPage.module.css';

export default function ContactMessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get2ankiApi()
      .listContactMessages()
      .then(setMessages)
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAcknowledge(id: number) {
    await get2ankiApi().acknowledgeContactMessage(id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_acknowledged: true } : m))
    );
  }

  if (loading) {
    return <p className={sharedStyles.emptyState}>Loading…</p>;
  }

  if (error) {
    return <p className={sharedStyles.alertDanger}>{error}</p>;
  }

  if (messages.length === 0) {
    return (
      <p className={sharedStyles.emptyState}>No contact messages yet.</p>
    );
  }

  const unread = messages.filter((m) => !m.is_acknowledged);
  const read = messages.filter((m) => m.is_acknowledged);

  return (
    <div className={styles.contactMessages}>
      {unread.length > 0 && (
        <section>
          <h2 className={sharedStyles.sectionTitle}>
            Unread ({unread.length})
          </h2>
          <ul className={styles.messageList}>
            {unread.map((m) => (
              <MessageCard key={m.id} message={m} onAcknowledge={handleAcknowledge} />
            ))}
          </ul>
        </section>
      )}
      {read.length > 0 && (
        <section>
          <h2 className={sharedStyles.sectionTitle}>Read ({read.length})</h2>
          <ul className={styles.messageList}>
            {read.map((m) => (
              <MessageCard key={m.id} message={m} onAcknowledge={handleAcknowledge} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

interface MessageCardProps {
  message: ContactMessage;
  onAcknowledge: (id: number) => void;
}

function MessageCard({ message, onAcknowledge }: MessageCardProps) {
  const attachments: string[] = (() => {
    try {
      return message.attachments ? JSON.parse(message.attachments) : [];
    } catch {
      return [];
    }
  })();

  const date = new Date(message.created_at).toLocaleString();

  return (
    <li
      className={`${styles.messageCard} ${message.is_acknowledged ? styles.messageCardRead : ''}`}
    >
      <div className={styles.messageHeader}>
        <div>
          <span className={styles.messageName}>{message.name}</span>
          <a
            href={`mailto:${message.email}`}
            className={styles.messageEmail}
          >
            {message.email}
          </a>
        </div>
        <span className={styles.messageDate}>{date}</span>
      </div>
      <p className={styles.messageBody}>{message.message}</p>
      {attachments.length > 0 && (
        <p className={styles.messageAttachments}>
          {attachments.length} attachment{attachments.length === 1 ? '' : 's'}:{' '}
          {attachments.join(', ')}
        </p>
      )}
      {!message.is_acknowledged && (
        <div className={styles.messageActions}>
          <button
            type="button"
            className={sharedStyles.btnSecondary}
            onClick={() => onAcknowledge(message.id)}
          >
            Mark as read
          </button>
          <a
            href={`mailto:${message.email}?subject=Re: your message to 2anki`}
            className={sharedStyles.btnPrimary}
          >
            Reply
          </a>
        </div>
      )}
    </li>
  );
}
