import { useEffect, useState } from 'react';

import Backend from '../../../lib/Backend';
import UserJob from '../../../lib/interfaces/UserJob';

export default function useActiveJobs(
  backend: Backend,
  setError: (error: string) => void,
): [UserJob[], (id: string) => void] {
  const [jobs, setJobs] = useState([]);

  async function deleteJob(id: string) {
    try {
      await backend.deleteJob(id);
      setJobs(jobs.filter((job: UserJob) => job.object_id !== id));
    } catch (error) {
      setError(error.response.data.message);
    }
  }

  useEffect(() => {
    async function fetchJobs() {
      try {
        const active = await backend.getActiveJobs();
        setJobs(active);
      } catch (error) {
        setError(error.response.data.message);
      }
    }
    fetchJobs();
  }, [backend]);

  return [jobs, deleteJob];
}
