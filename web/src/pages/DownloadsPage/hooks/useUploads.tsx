import { useState, useEffect } from 'react';

import Backend from '../../../lib/backend';
import UserUpload from '../../../lib/interfaces/UserUpload';

interface UseUploads {
  error: unknown;
  loading: boolean;
  uploads: UserUpload[] | undefined;
  deleteUpload: (key: string) => Promise<void>;
  refreshUploads: () => Promise<void>;
}

export default function useUploads(backend: Backend): UseUploads {
  const [uploads, setUploads] = useState<UserUpload[] | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUploads = async () => {
    try {
      return await backend.getUploads();
    } catch (fetchError) {
      setError(fetchError);
    }
    return undefined;
  };

  const refreshUploads = async () => {
    const data = await fetchUploads();
    if (data) {
      setUploads(data);
    }
  };
  const deleteUpload = async (key: string) => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await backend.deleteUpload(key);
      setUploads(uploads?.filter((u) => u.key !== key));
    } catch (err) {
      setError(err);
    }
    setIsDeleting(false);
  };

  useEffect(() => {
    fetchUploads().then((data) => {
      setUploads(data);
      setLoading(false);
    });

    const intervalId = setInterval(() => {
      fetchUploads().then((data) => {
        if (data) {
          setUploads(data);
        }
      });
    }, 10000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend]);

  return {
    deleteUpload,
    loading,
    uploads,
    error,
    refreshUploads,
  };
}
