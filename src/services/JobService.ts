import JobRepository from '../data_layer/JobRepository';

class JobService {
  constructor(private readonly repository: JobRepository) {}

  getJobsByOwner(owner: string) {
    return this.repository.getJobsByOwner(owner);
  }

  deleteJobById(id: string, owner: string) {
    return this.repository.deleteJob(id, owner);
  }

  async getAllStartedJobs(owner: string) {
    const jobs = await this.repository.getJobsByOwner(owner);
    return jobs.filter((job) => job.status === 'started');
  }
}

export default JobService;
