interface Props {
  jobs: any[];
  deleteJob: (id: string) => void;
}

export default function ActiveJobs({ jobs, deleteJob }: Props) {
  return (
    <div className="">
      <h2 className="title is-2">Active Jobs</h2>
      <div className="is-pulled-right">
        <button
          type="button"
          onClick={() => {
            window.location.href = '/uploads/mine';
          }}
          className="button"
        >
          Refresh
        </button>
      </div>
      <ul className="my-2">
        {jobs.map((j) => (
          <li className="is-flex">
            <button
              aria-label="delete"
              type="button"
              className="delete"
              onClick={() => deleteJob(j.object_id)}
            />
            <span className="tag mx-2">{j.status}</span>
            {j.object_id}
          </li>
        ))}
      </ul>
    </div>
  );
}
