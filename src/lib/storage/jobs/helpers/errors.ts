export class InProgressJobError extends Error {
  constructor(jobId: string) {
    super(`Job ${jobId} is already in progress`);
    this.name = 'InProgressJobError';
  }
}

export class JobLimitError extends Error {
  constructor(owner: string) {
    super(`Job limit reached for owner ${owner}`);
    this.name = 'JobLimitError';
  }
}

export class ConversionFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversionFailedError';
  }
}
