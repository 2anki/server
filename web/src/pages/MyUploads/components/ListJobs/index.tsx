import { useState } from 'react';
import { JobRow } from '../styled';
import Jobs, { JobsId } from '../../../../schemas/public/Jobs';
import { RefreshButton } from './RefreshButton';
import { DeleteButton } from './DeleteButton';
import { isFailedJob } from '../../helpers/isFailedJob';
import { JobStatus, StatusTag } from './StatusTag';
import { getDistance } from '../../../../lib/getDistance';

interface Props {
  jobs: Jobs[];
  deleteJob: (id: JobsId) => void;
  restartJob: (job: Jobs) => void;
}

export default function Index({ jobs, deleteJob, restartJob }: Props) {
  const [hover, setHover] = useState<JobsId | null>(null);
  if (!jobs || jobs.length === 0) {
    return null;
  }


  const jobRows = <ul className="my-2">
    {jobs.map((j) => (
      <div key={j.id}
           className="is-flex is-justify-content-space-between"
      >
        <JobRow
          className={`${hover === j.id ? 'has-background-info-light' : ''}`}
        >
          <StatusTag status={j.status as JobStatus} />
          <div className="is-flex is-flex-direction-column">
            <p className="title is-6">{j.title}</p>
            <p className="subtitle is-7">{j.created_at && `Started ${getDistance(j.created_at)}`}</p>
          </div>
        </JobRow>
        <div
          onMouseEnter={() => setHover(j.id)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="is-pulled-right">
            <DeleteButton onDelete={() => deleteJob(j.id)} />
            {isFailedJob(j) && <RefreshButton onRefresh={() => {
              restartJob(j);
              window.location.reload();
            }} />}
          </div>
        </div>
      </div>
    ))}
  </ul>;

  return (
    <div className="" data-hj-suppress>
      {jobRows}
    </div>
  );
}
