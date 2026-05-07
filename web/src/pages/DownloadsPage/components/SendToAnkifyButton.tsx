import { useMutation, useQuery } from '@tanstack/react-query';

import { get2ankiApi } from '../../../lib/backend/get2ankiApi';
import { useUserLocals } from '../../../lib/hooks/useUserLocals';

interface Props {
  readonly uploadId: number | string;
  readonly filename: string | null;
}

const ANKIFY_ENABLED_EMAIL = 'alexander@alemayhu.com';

export default function SendToAnkifyButton({ uploadId, filename }: Props) {
  const { data } = useUserLocals();
  const isEnabled =
    data?.user?.email?.toLowerCase() === ANKIFY_ENABLED_EMAIL.toLowerCase();
  const api = get2ankiApi();

  const { data: clients } = useQuery({
    queryKey: ['ankify-clients'],
    queryFn: () => api.listAnkifyClients(),
    enabled: isEnabled,
  });

  const dispatch = useMutation({
    mutationFn: () => api.dispatchUploadToAnkify(Number(uploadId)),
  });

  if (!isEnabled) {
    return null;
  }

  const hasActive = (clients ?? []).some((c) => c.status === 'active');
  const disabled = dispatch.isPending || !hasActive;

  const label = (() => {
    if (dispatch.isPending) return 'Sending to Anki…';
    if (dispatch.isSuccess) {
      const data = dispatch.data;
      const parts = [];
      if (data.created > 0) parts.push(`${data.created} new`);
      if (data.updated > 0) parts.push(`${data.updated} updated`);
      const counts = parts.length > 0 ? parts.join(', ') : 'Sent';
      const sync =
        data.anki_web_sync === 'synced'
          ? ' · synced to AnkiWeb'
          : data.anki_web_sync === 'failed'
            ? ' · AnkiWeb sync skipped'
            : '';
      return `${counts}${sync}`;
    }
    if (dispatch.isError) return 'Retry';
    return 'Send to Ankify';
  })();

  const title = (() => {
    if (!hasActive) return 'Provision an Ankify client first';
    if (dispatch.isError) return (dispatch.error as Error).message;
    if (dispatch.isSuccess && dispatch.data.anki_web_sync === 'failed') {
      return `AnkiWeb didn't accept the sync — open Anki in your browser and sign in to AnkiWeb. ${dispatch.data.anki_web_sync_error ?? ''}`;
    }
    return `Send ${filename ?? 'this deck'} to your hosted Anki and sync to AnkiWeb (takes a moment)`;
  })();

  return (
    <button
      type="button"
      onClick={() => dispatch.mutate()}
      disabled={disabled}
      title={title}
      style={{
        background: 'none',
        border: '1px solid #ddd',
        borderRadius: '0.4rem',
        padding: '0.25rem 0.5rem',
        fontSize: '0.85rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
