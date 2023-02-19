import { useEffect, useState } from 'react';
import Backend from '../../../lib/backend';
import { redirectOnError } from '../../../components/shared/redirectOnError';

export interface NotionData {
  loading: boolean;
  workSpace: string | null;
  connected: boolean;
  connectionLink: string;
}

export default function useNotionData(backend: Backend): NotionData {
  const [connectionLink, updateConnectionLink] = useState('');
  const [connected, updateConnected] = useState(false);
  const [workSpace, setWorkSpace] = useState<string | null>(
    localStorage.getItem('__workspace')
  );

  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    backend
      .getNotionConnectionInfo()
      .then((data) => {
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
      .catch(redirectOnError);
  }, []);

  return {
    loading,
    workSpace,
    connected,
    connectionLink,
  };
}
