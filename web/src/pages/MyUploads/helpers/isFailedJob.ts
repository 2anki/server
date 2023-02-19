import Jobs from '../../../schemas/public/Jobs';

export const isFailedJob = (j: Jobs) => j.status === 'failed';
