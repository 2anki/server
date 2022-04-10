import { useEffect, useState } from 'react';

import Backend from '../../../lib/Backend';

export default function usePatreon(backend: Backend, setError: (error: string) => void) {
  const [isPatreon, setIsPatreon] = useState(false);

  useEffect(() => {
    async function fetchIsPatreon() {
      try {
        const is = await backend.isPatreon();
        setIsPatreon(is);
      } catch (error) {
        setError(error.response.data.message);
      }
    }
    if (!isPatreon) {
      fetchIsPatreon();
    }
  }, [isPatreon]);

  return [isPatreon];
}
