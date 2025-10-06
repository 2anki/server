import JobRepository from '../data_layer/JobRepository';

class JobService {
  constructor(private readonly repository: JobRepository) {}

  getJobsByOwner(owner: string) {
    return this.repository.getJobsByOwner(owner);
  }

  async deleteJobById(id: string, owner: string) {
    // The id parameter here is actually the database primary key (job.id)
    // We need to find the job by its database ID first to check its status
    const jobs = await this.repository.getJobsByOwner(owner);
    const job = jobs.find((j) => j.id.toString() === id);

    if (!job) {
      // Job doesn't exist, nothing to do
      return;
    }

    // Prevent deleting jobs that are in progress
    if (job.status === 'started' || job.status.startsWith('step')) {
      throw new Error('Cannot delete job while it is in progress');
    }

    // Delete the job using the database ID
    return this.repository.deleteJob(id, owner);
  }

  async getAllStartedJobs(owner: string) {
    const jobs = await this.repository.getJobsByOwner(owner);
    return jobs.filter((job) => job.status === 'started');
  }
}

export default JobService;
