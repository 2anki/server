import { useEffect, useState } from 'react';
import { ErrorHandlerType } from '../../../components/errors/helpers/getErrorMessage';

import Backend from '../../../lib/backend';
import { JobsId } from '../../../schemas/public/Jobs';
import JobResponse from '../../../schemas/public/JobResponse';

interface UseJobsResult {
  jobs: JobResponse[];
  deleteJob: (id: JobsId) => Promise<void>;
  restartJob: (job: JobResponse) => Promise<void>;
  refreshJobs: () => Promise<void>;
}

export default function useJobs(
  backend: Backend,
  setError: ErrorHandlerType
): UseJobsResult {
  const [jobs, setJobs] = useState<JobResponse[]>([]);

  async function fetchJobs() {
    try {
      const active = await backend.getJobs();
      setJobs(active);
    } catch (error) {
      setError(error);
    }
  }

  async function deleteJob(id: JobsId) {
    try {
      await backend.deleteJob(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot delete job while it is in progress')) {
        setError(new Error('Cannot delete this job because it is currently running. Please wait for it to complete.'));
      } else {
        setError(error);
      }
    }
  }

  async function restartJob(job: JobResponse) {
    try {
      if (job.type === 'claude') {
        await backend.restartClaudeJob(job.object_id);
      } else {
        await backend.convert(job.object_id, job.type, job.title);
      }
      await fetchJobs();
    } catch (error) {
      setError(error);
    }
  }

  const hasActiveJobs = jobs.some(
    (j) => !['done', 'failed', 'cancelled', 'interrupted'].includes(j.status)
  );

  useEffect(() => {
    fetchJobs();
    const intervalMs = hasActiveJobs ? 3000 : 10000;
    const intervalId = setInterval(fetchJobs, intervalMs);
    return () => clearInterval(intervalId);
  }, [backend, hasActiveJobs]);

  return { jobs, deleteJob, restartJob, refreshJobs: fetchJobs };
}
