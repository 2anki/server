import { useEffect, useState } from 'react';

import UserUpload from '../../../lib/interfaces/UserUpload';

export default function useQuota(uploads: UserUpload[]) {
  const [quota, setQuota] = useState(0);
  useEffect(() => {
    if (uploads.length > 0) {
      const diskUsage = uploads
        .map((u) => u.size_mb)
        .reduce((acc, cv) => acc + cv);
      setQuota(diskUsage);
    } else if (quota !== 0) {
      setQuota(0);
    }
  }, [uploads]);
  return [quota];
}
