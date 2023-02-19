import { useEffect, useState } from 'react';
import {
  ErrorHandlerType,
  ErrorType
} from '../../../components/errors/helpers/types';

import Backend from '../../../lib/backend';
import Jobs, { JobsId } from '../../../schemas/public/Jobs';

interface UseJobsResult {
  jobs: Jobs[];
  deleteJob: (id: JobsId) => Promise<void>;
  restartJob: (job: Jobs) => Promise<void>;
}

export default function useJobs(
  backend: Backend,
  setError: ErrorHandlerType
): UseJobsResult {
  const [jobs, setJobs] = useState<Jobs[]>([]);

  async function fetchJobs() {
    try {
      const active = await backend.getJobs();
      setJobs(active);
    } catch (error) {
      setError(error as ErrorType);
    }
  }

  async function deleteJob(id: JobsId) {
    try {
      await backend.deleteJob(id);
      setJobs(jobs.filter((job: Jobs) => job.id !== id));
    } catch (error) {
      setError(error as ErrorType);
    }
  }

  async function restartJob(job: Jobs) {
    await backend.convert(job.object_id, '', job.title);
  }

  useEffect(() => {
    fetchJobs();
  }, [backend]);

  return { jobs, deleteJob, restartJob };
}
