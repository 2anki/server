import { useState, useEffect } from 'react';

import Backend from '../../../lib/backend';
import UserUpload from '../../../lib/interfaces/UserUpload';

interface UseUploads {
  error: unknown;
  loading: boolean;
  uploads: UserUpload[] | undefined;
  isDeleting: boolean;
  deleteUpload: (key: string) => Promise<void>;
}

export default function useUploads(backend: Backend): UseUploads {
  const [uploads, setUploads] = useState<UserUpload[] | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteUpload = async (key: string) => {
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
    async function fetchUploads() {
      try {
        return await backend.getUploads();
      } catch (fetchError) {
        setError(fetchError);
      }
      return undefined;
    }

    fetchUploads().then((data) => {
      setUploads(data);
      setLoading(false);
    });
  }, [backend]);

  return {
    isDeleting, deleteUpload,
    loading, uploads, error
  };
}
