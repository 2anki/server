import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get, patch, del } from '../../lib/backend/api';
import ChatPanel, { type Message } from '../../components/ChatPanel/ChatPanel';
import ConversationsSidebar, {
  ConversationSummary,
} from './ConversationsSidebar';
import styles from './ChatPage.module.css';

interface ApiConversationsResponse {
  conversations: ConversationSummary[];
}

interface ApiConversationDetailMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  cards?: { front: string; back: string }[];
  contentBefore?: string;
  contentAfter?: string;
}

interface ApiConversationDetailResponse {
  id: number;
  title: string;
  draft: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ApiConversationDetailMessage[];
}

const STARTER_PROMPTS = [
  "Make 10 cards from notes I'll paste",
  'Explain a concept, then make cards',
  'Turn this into cloze cards: [paste]',
];

interface PanelSeed {
  key: string;
  conversationId: number | null;
  messages: Message[];
  draft: string;
}

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const cameFromUpload = searchParams.get('from') === 'upload';
  const uploadFilename = searchParams.get('filename');
  const prefilledPrompt = cameFromUpload
    ? `I tried to convert ${uploadFilename ?? 'this file'} and got stuck. What can I do?`
    : '';

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [panelSeed, setPanelSeed] = useState<PanelSeed>({
    key: 'new',
    conversationId: null,
    messages: [],
    draft: prefilledPrompt,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(true);

  useEffect(() => {
    get('/api/chat/conversations', { redirect: false })
      .then((data: ApiConversationsResponse | undefined) => {
        if (data != null && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      })
      .catch(() => {
      });
  }, []);

  function upsertConversation(id: number, title: string): void {
    setConversations((prev) => {
      const updatedAt = new Date().toISOString();
      const existing = prev.find((c) => c.id === id);
      if (existing != null) {
        return [
          { ...existing, title, updatedAt },
          ...prev.filter((c) => c.id !== id),
        ];
      }
      return [{ id, title, updatedAt }, ...prev];
    });
  }

  async function handleSelectConversation(id: number) {
    if (id === activeConversationId) return;
    setLoadError(null);
    setActiveConversationId(id);
    try {
      const data = (await get(`/api/chat/conversations/${id}`, { redirect: false })) as
        | ApiConversationDetailResponse
        | undefined;
      if (data == null) return;
      const loaded: Message[] = data.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.cards == null ? {} : { cards: m.cards }),
        ...(m.contentBefore == null ? {} : { contentBefore: m.contentBefore }),
        ...(m.contentAfter == null ? {} : { contentAfter: m.contentAfter }),
      }));
      setPanelSeed({
        key: `conv-${id}`,
        conversationId: id,
        messages: loaded,
        draft: data.draft ?? '',
      });
      setShowEmptyState(loaded.length === 0);
    } catch {
      setLoadError("Couldn't load this conversation.");
    }
  }

  function handleNewConversation() {
    setActiveConversationId(null);
    setPanelSeed({ key: `new-${Date.now()}`, conversationId: null, messages: [], draft: '' });
    setShowEmptyState(true);
    setLoadError(null);
  }

  async function handleRenameConversation(id: number, title: string) {
    const previous = conversations;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
    try {
      const response = await patch(`/api/chat/conversations/${id}`, { title });
      if (!response.ok) {
        setConversations(previous);
        setLoadError("Couldn't rename this conversation.");
      }
    } catch {
      setConversations(previous);
      setLoadError("Couldn't rename this conversation.");
    }
  }

  async function handleDeleteConversation(id: number) {
    const previous = conversations;
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === activeConversationId) {
      handleNewConversation();
    }
    try {
      const response = await del(`/api/chat/conversations/${id}`, { redirect: false });
      if (response == null) return;
      if (!response.ok) {
        setConversations(previous);
        setLoadError("Couldn't delete this conversation.");
      }
    } catch {
      setConversations(previous);
      setLoadError("Couldn't delete this conversation.");
    }
  }

  return (
    <div className={styles.layout} data-hj-suppress>
      <ConversationsSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
      />
      <div className={styles.container}>
        {showEmptyState && (
          <div className={styles.emptyState}>
            <h1 className={styles.emptyHeading}>Chat</h1>
            <p className={styles.emptySubhead}>
              {cameFromUpload
                ? "Tell me what's in your file — I'll help you get cards out of it."
                : 'A study assistant. Paste your notes, ask for cards, or work through a concept.'}
            </p>
            {!cameFromUpload && (
              <div className={styles.starterChips}>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className={styles.starterChip}
                    onClick={() =>
                      setPanelSeed((prev) => ({ ...prev, draft: prompt }))
                    }
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {loadError != null && (
          <p style={{ color: 'var(--color-danger)', padding: '0 1.5rem', fontSize: 'var(--text-sm)' }}>
            {loadError}
          </p>
        )}
        <ChatPanel
          key={panelSeed.key}
          initialPrompt={panelSeed.draft}
          cameFromUpload={cameFromUpload}
          initialConversationId={panelSeed.conversationId}
          initialMessages={panelSeed.messages}
          onConversationCreated={(id, title) => {
            upsertConversation(id, title);
            setActiveConversationId(id);
            setShowEmptyState(false);
          }}
          onConversationNotFound={() => {
            setActiveConversationId(null);
            setShowEmptyState(true);
          }}
        />
      </div>
    </div>
  );
}
