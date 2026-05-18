import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { get2ankiApi } from '../../../lib/backend/get2ankiApi';

const DISMISSED_COOKIE = 'notion_sync_banner_dismissed';
const BANNER_REF = 'upload-notion-banner';
const DISMISS_TTL_DAYS = 30;

interface NotionSyncBannerProps {
  autoSyncActive: boolean;
}

export function NotionSyncBanner({ autoSyncActive }: Readonly<NotionSyncBannerProps>) {
  const [cookies, setCookie] = useCookies([DISMISSED_COOKIE]);
  const [locallyDismissed, setLocallyDismissed] = useState(false);
  const cookieDismissed = cookies[DISMISSED_COOKIE] === 'true';
  const isDismissed = locallyDismissed || cookieDismissed;

  const { data: notionData } = useQuery({
    queryKey: ['notion-connection-info'],
    queryFn: () => get2ankiApi().getNotionConnectionInfo(),
    enabled: !autoSyncActive && !isDismissed,
    retry: false,
  });

  const isNotionConnected = notionData?.isConnected === true;

  if (autoSyncActive || isDismissed || !isNotionConnected) {
    return null;
  }

  const handleDismiss = () => {
    setLocallyDismissed(true);
    const expires = new Date();
    expires.setDate(expires.getDate() + DISMISS_TTL_DAYS);
    setCookie(DISMISSED_COOKIE, 'true', { path: '/', expires });
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.75rem 1rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-secondary)',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        You exported this from Notion — Auto Sync would re-export automatically every 5 minutes.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
        <a
          href={`/pricing?ref=${BANNER_REF}`}
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-primary)',
            textDecoration: 'none',
          }}
        >
          Try Auto Sync →
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss Auto Sync banner"
          style={{
            background: 'none',
            border: 'none',
            padding: '0.25rem',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-base)',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
