import { useEffect, useRef, useState } from 'react';
import { useUserLocals } from '../../lib/hooks/useUserLocals';
import { get, post } from '../../lib/backend/api';
import SendIcon from '../../components/icons/SendIcon';
import AssistantMarkdown from './AssistantMarkdown';
import CardPreview from './CardPreview';
import styles from './ChatPage.module.css';

interface ChatCard {
  front: string;
  back: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  contentBefore?: string;
  contentAfter?: string;
  cards?: ChatCard[];
}

interface ApiDonePayload {
  content: string;
  contentBefore?: string;
  contentAfter?: string;
  cards?: ChatCard[];
}

interface ApiErrorPayload {
  type: 'rate_limit' | 'server_error';
  resetDate?: string;
}

interface ApiUsageResponse {
  used: number;
  limit: number | null;
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

function visibleStreamingText(text: string): string {
  const fenceIndex = text.search(/(?:^|\n)```json/);
  if (fenceIndex !== -1) return text.slice(0, fenceIndex);
  const rawArrayIndex = text.search(/(?:^|\n)\s*\[\s*\{/);
  return rawArrayIndex === -1 ? text : text.slice(0, rawArrayIndex);
}

async function downloadDeck(cards: ChatCard[], deckName: string): Promise<void> {
  const response = await post('/api/chat/deck', { cards, deckName });
  if (!response.ok) {
    throw new Error('Failed to generate deck');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deckName}.apkg`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ChatPage() {
  const { data: userLocals } = useUserLocals();
  const isPatreon = userLocals?.user?.patreon === true;

  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedUserMessages, setExpandedUserMessages] = useState<Set<number>>(new Set());
  const [streamingText, setStreamingText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [resetDate, setResetDate] = useState<string | null>(null);
  const [messagesUsedThisMonth, setMessagesUsedThisMonth] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    get('/api/chat/usage', { redirect: false })
      .then((data: ApiUsageResponse | undefined) => {
        if (data != null) {
          setMessagesUsedThisMonth(data.used);
          if (data.limit != null && data.used >= data.limit) {
            setLimitReached(true);
          }
        }
      })
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    const el = messageListRef.current;
    if (el == null) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: streamingText.length > 0 ? 'auto' : 'smooth' });
    }
  }, [messages, isLoading, streamingText]);

  const remainingMessages = FREE_MONTHLY_LIMIT - messagesUsedThisMonth;

  const canSend = inputValue.trim().length > 0 && !isLoading && !limitReached;

  async function sendMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setNetworkError(null);
    setIsLoading(true);
    setStreamingText('');

    const history = nextMessages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await post('/api/chat/message', { content, history });

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        setNetworkError(data.error ?? "Couldn't send this message. Try again.");
        setIsLoading(false);
        return;
      }

      if (response.body == null) {
        setNetworkError("Couldn't send this message. Try again.");
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          const lines = rawEvent.split('\n');
          let eventType = '';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              data = line.slice(6);
            }
          }

          if (eventType === 'token') {
            const text = JSON.parse(data) as string;
            setStreamingText((prev) => prev + text);
          } else if (eventType === 'done') {
            const result = JSON.parse(data) as ApiDonePayload;
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: result.content,
                contentBefore: result.contentBefore,
                contentAfter: result.contentAfter,
                cards: result.cards,
              },
            ]);
            setStreamingText('');
            setMessagesUsedThisMonth((n) => n + 1);
          } else if (eventType === 'error') {
            const err = JSON.parse(data) as ApiErrorPayload;
            if (err.type === 'rate_limit') {
              setLimitReached(true);
              if (err.resetDate != null) setResetDate(err.resetDate);
            } else {
              setNetworkError("Couldn't send this message. Try again.");
            }
          }
        }
      }
    } catch {
      setNetworkError("Couldn't send this message. Try again.");
    } finally {
      setIsLoading(false);
      setStreamingText('');
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

  function toggleUserMessage(index: number) {
    setExpandedUserMessages((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleSaveAsDeck(cards: ChatCard[], deckName: string) {
    downloadDeck(cards, deckName).catch(() => {
      setNetworkError("Couldn't generate the deck. Try again.");
    });
  }

  const isCardStreaming = /(?:^|\n)```json/.test(streamingText) || /(?:^|\n)\s*\[\s*\{/.test(streamingText);

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.container}>
      {hasMessages || isLoading ? (
        <div className={styles.messageList} ref={messageListRef}>
          <div className={styles.messageListInner}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`${styles.message} ${m.role === 'user' ? styles.messageUser : styles.messageAssistant} ${m.role === 'assistant' && m.cards != null && m.cards.length > 0 ? styles.messageAssistantWithCards : ''}`}
            >
              {m.role === 'user' && (() => {
                const isLong = m.content.length > 600 || m.content.split('\n').length > 12;
                const isExpanded = expandedUserMessages.has(i);
                return (
                  <>
                    <div
                      className={`${styles.messageBubble} ${styles.messageBubbleUser} ${isLong ? styles.userBubbleCollapsible : ''} ${isLong && !isExpanded ? styles.userBubbleClamped : ''}`}
                    >
                      {m.content}
                    </div>
                    {isLong && (
                      <button
                        type="button"
                        className={styles.expandToggle}
                        onClick={() => toggleUserMessage(i)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? 'Show less' : 'Show full message'}
                      </button>
                    )}
                  </>
                );
              })()}
              {m.role === 'assistant' && (
                <>
                  {m.contentBefore != null && (
                    <AssistantMarkdown>{m.contentBefore}</AssistantMarkdown>
                  )}
                  {m.cards != null && m.cards.length > 0 && (
                    <CardPreview
                      cards={m.cards}
                      onSave={(deckName) => handleSaveAsDeck(m.cards!, deckName)}
                    />
                  )}
                  {m.contentAfter != null && (
                    <AssistantMarkdown>{m.contentAfter}</AssistantMarkdown>
                  )}
                  {m.cards == null && (
                    <AssistantMarkdown>{m.content}</AssistantMarkdown>
                  )}
                </>
              )}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.messageAssistant}`}>
              {streamingText.length > 0 ? (
                <>
                  <AssistantMarkdown isStreaming={!isCardStreaming}>
                    {visibleStreamingText(streamingText)}
                  </AssistantMarkdown>
                  {isCardStreaming && (
                    <span className={styles.buildingCards}>Building cards</span>
                  )}
                </>
              ) : (
                <div className={styles.messageSkeleton} />
              )}
            </div>
          )}
          <div ref={bottomRef} />
          </div>
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
        {!isPatreon && !limitReached && messagesUsedThisMonth > 0 && (
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
