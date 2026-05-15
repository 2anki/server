import { useState, useEffect } from 'react';

import Backend, { DropboxUpload } from '../../../lib/backend';

interface UseDropboxUploads {
  uploads: DropboxUpload[];
  loading: boolean;
  error: boolean;
  deleteUpload: (id: number) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const PAGE_SIZE = 10;
const LOAD_MORE_SIZE = 20;

export default function useDropboxUploads(backend: Backend): UseDropboxUploads {
  const [uploads, setUploads] = useState<DropboxUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    backend
      .getDropboxUploads(0)
      .then((data) => {
        setUploads(data);
        setHasMore(data.length >= PAGE_SIZE);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [backend]);

  const deleteUpload = async (id: number) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await backend.deleteDropboxUpload(id);
      setUploads((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadMore = async () => {
    const nextOffset = offset + LOAD_MORE_SIZE;
    try {
      const data = await backend.getDropboxUploads(nextOffset);
      setUploads((prev) => [...prev, ...data]);
      setOffset(nextOffset);
      setHasMore(data.length >= PAGE_SIZE);
    } catch {
      setError(true);
    }
  };

  return { uploads, loading, error, deleteUpload, loadMore, hasMore };
}
