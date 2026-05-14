import { useEffect, useRef, useState } from 'react';
import { useUserLocals } from '../../lib/hooks/useUserLocals';
import { post } from '../../lib/backend/api';
import ChatBubbleIcon from '../../components/icons/ChatBubbleIcon';
import SendIcon from '../../components/icons/SendIcon';
import styles from './ChatPage.module.css';

interface ChatCard {
  front: string;
  back: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  cards?: ChatCard[];
}

interface ApiSuccessResponse {
  role: 'assistant';
  content: string;
  cards?: ChatCard[];
}

interface ApiRateLimitResponse {
  error: string;
  resetDate: string;
}

const STARTER_PROMPTS = [
  'Make 10 cards from notes I\'ll paste',
  'Explain a concept, then make cards',
  'Turn this into cloze cards: [paste]',
];

const FREE_MONTHLY_LIMIT = 20;

function formatResetDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function ChatPage() {
  const { data: userLocals } = useUserLocals();
  const isPatreon = userLocals?.user?.patreon === true;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [resetDate, setResetDate] = useState<string | null>(null);
  const [messagesSentThisSession, setMessagesSentThisSession] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const remainingMessages = FREE_MONTHLY_LIMIT - messagesSentThisSession;

  const canSend = inputValue.trim().length > 0 && !isLoading && !limitReached;

  async function sendMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setNetworkError(null);
    setIsLoading(true);

    const history = nextMessages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await post('/api/chat/message', { content, history });

      if (response.status === 429) {
        const data: ApiRateLimitResponse = await response.json();
        setLimitReached(true);
        setResetDate(data.resetDate);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setNetworkError("Couldn't send this message. Try again.");
        setIsLoading(false);
        return;
      }

      const data: ApiSuccessResponse = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content, cards: data.cards },
      ]);
      setMessagesSentThisSession((n) => n + 1);
    } catch {
      setNetworkError("Couldn't send this message. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        sendMessage(inputValue);
      }
    }
  }

  function handleSaveAsDeck(cards: ChatCard[]) {
    const deckName = globalThis.prompt('Deck name:');
    if (deckName == null || deckName.trim().length === 0) return;

    const lines = cards.map((c) => `${c.front}\t${c.back}`).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckName.trim()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.container}>
      {hasMessages ? (
        <div className={styles.messageList}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`${styles.message} ${m.role === 'user' ? styles.messageUser : styles.messageAssistant}`}
            >
              <div
                className={`${styles.messageBubble} ${m.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}
              >
                {m.content}
              </div>
              {m.role === 'assistant' && m.cards != null && m.cards.length > 0 && (
                <button
                  type="button"
                  className={styles.saveAsDeckBtn}
                  onClick={() => handleSaveAsDeck(m.cards!)}
                >
                  <ChatBubbleIcon width={14} height={14} />
                  Save as deck
                </button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.messageAssistant}`}>
              <div className={styles.messageSkeleton} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h1 className={styles.emptyHeading}>Chat</h1>
          <p className={styles.emptySubhead}>
            A study assistant. Paste your notes, ask for cards, or work through a concept.
          </p>
          <div className={styles.starterChips}>
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className={styles.starterChip}
                onClick={() => {
                  setInputValue(prompt);
                  textareaRef.current?.focus();
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.inputArea}>
        {limitReached && resetDate != null && (
          <div className={styles.limitPanel}>
            <span>
              You've used all {FREE_MONTHLY_LIMIT} messages this month. Resets {formatResetDate(resetDate)}.
            </span>
            <a
              href="https://www.patreon.com/alemayhu"
              target="_blank"
              rel="noreferrer"
              className={styles.limitPanelLink}
            >
              See Patreon plans
            </a>
          </div>
        )}
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a study question or paste notes…"
            disabled={isLoading || limitReached}
            rows={1}
            aria-label="Message input"
          />
          <button
            type="button"
            className={styles.sendBtn}
            onClick={() => sendMessage(inputValue)}
            disabled={!canSend}
            aria-label="Send message"
          >
            <SendIcon width={18} height={18} />
          </button>
        </div>
        {!isPatreon && !limitReached && messagesSentThisSession > 0 && (
          <p className={styles.usageLine}>
            {remainingMessages} of {FREE_MONTHLY_LIMIT} messages left this month
          </p>
        )}
        {networkError != null && (
          <p className={styles.networkError}>{networkError}</p>
        )}
      </div>
    </div>
  );
}
