import { useEffect, useState } from 'react';

import Backend from '../../../lib/backend';

export default function usePatreon(backend: Backend): [boolean] {
  const [isPatron, setIsPatreon] = useState(false);

  useEffect(() => {
    async function fetchIsPatreon() {
      try {
        const is = await backend.isPatreon();
        setIsPatreon(is);
        // eslint-disable-next-line no-empty
      } catch (_ignored) {}
    }
    if (!isPatron) {
      fetchIsPatreon();
    }
  }, [isPatron]);

  return [isPatron];
}
