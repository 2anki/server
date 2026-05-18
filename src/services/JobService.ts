import JobRepository, { JobWithDownloadKey } from '../data_layer/JobRepository';

class JobService {
  constructor(private readonly repository: JobRepository) {}

  getJobsByOwner(owner: string): Promise<JobWithDownloadKey[]> {
    return this.repository.getJobsByOwner(owner);
  }

  async deleteJobById(
    id: string,
    owner: string
  ): Promise<JobWithDownloadKey | null> {
    const jobs = await this.repository.getJobsByOwner(owner);
    const job = jobs.find((j) => j.id.toString() === id);

    if (!job) {
      return null;
    }

    if (job.status === 'started' || job.status.startsWith('step')) {
      throw new Error('Cannot delete job while it is in progress');
    }

    await this.repository.deleteJob(id, owner);
    return job;
  }

  findJobByObjectId(objectId: string, owner: string) {
    return this.repository.findJobById(objectId, owner);
  }

  async getAllStartedJobs(owner: string) {
    const jobs = await this.repository.getJobsByOwner(owner);
    return jobs.filter((job) => job.status === 'started');
  }
}

export default JobService;
