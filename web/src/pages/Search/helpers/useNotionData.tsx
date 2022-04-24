import { useEffect, useState } from 'react';
import Backend from '../../../lib/Backend';

export interface NotionData {
  loading: boolean;
  workSpace: any;
  connected: boolean;
  connectionLink: string;
}

export default function useNotionData(backend: Backend): NotionData {
  const [connectionLink, updateConnectionLink] = useState('');
  const [connected, updateConnected] = useState(false);
  const [workSpace, setWorkSpace] = useState(
    localStorage.getItem('__workspace'),
  );

  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    backend
      .getNotionConnectionInfo()
      .then((response) => {
        const { data } = response;
        if (data && !data.isConnected) {
          updateConnectionLink(data.link);
          updateConnected(data.isConnected);
        } else {
          updateConnectionLink(data.link);
          updateConnected(true);
        }
        setWorkSpace(data.workspace);
        setIsLoading(false);
      })
      .catch(() => {
        window.location.href = '/login#login';
      });
  }, []);

  return {
    loading, workSpace, connected, connectionLink,
  };
}
