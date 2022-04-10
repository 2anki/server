import { useState, useEffect } from 'react';

import Backend from '../../../lib/Backend';
import UserUpload from '../../../lib/interfaces/UserUpload';

export default function useUploads(
  backend: Backend,
  setError: (error: string) => void,
):[boolean, UserUpload[], (id: string) => void, () => void, boolean] {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setIsDeletingAll] = useState(false);

  async function deleteUpload(key: string) {
    try {
      await backend.deleteUpload(key);
      setUploads(uploads.filter((upload: UserUpload) => upload.key !== key));
    } catch (error) {
      setError(error.response.data.message);
    }
  }

  async function deleteAllUploads(): Promise<void> {
    setIsDeletingAll(true);
    return uploads.reduce(
      (prev, arg) => prev.then(() => deleteUpload(arg.id)),
      Promise.resolve().then(() => setIsDeletingAll(false)),
    );
  }

  useEffect(() => {
    async function fetchUploads() {
      try {
        const data = await backend.getUploads();
        setUploads(data);
      } catch (error) {
        setError(error.response.data.message);
      }
      setLoading(false);
    }
    if (uploads.length === 0) {
      fetchUploads();
    }
  }, [backend]);

  return [loading, uploads, deleteUpload, deleteAllUploads, deletingAll];
}
