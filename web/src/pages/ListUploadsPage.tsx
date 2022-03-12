import { useEffect, useState } from 'react';
import BecomeAPatron from '../components/BecomeAPatron';
import Container from '../components/Container';
import UploadObjectEntry from '../components/Dashboard/UploadObjectEntry';
import LoadingScreen from '../components/LoadingScreen';
import Backend from '../lib/Backend';

const backend = new Backend();

interface ListUploadsPageProps {
  setError: (error: string) => void;
}

function ListUploadsPage({ setError }: ListUploadsPageProps) {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [deletingAll, setIsDeletingAll] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [quota, setQuota] = useState(0);
  const [isPatreon, setIsPatreon] = useState(false);

  useEffect(() => {
    if (loading) {
      backend.getUploads().then((res) => {
        if (res && res.length > 0) {
          const diskUsage = res
            .map((u) => u.size_mb)
            .reduce((acc, cv) => acc + cv);
          setQuota(diskUsage);
        }
        setUploads(res);
        setLoading(false);
      });
      backend.getActiveJobs().then((res) => {
        setJobs(res);
      });
      backend.isPatreon().then((is) => setIsPatreon(is));
    }
    // TODO: handle error
  }, [loading]);

  if (loading) return <LoadingScreen />;
  // TODO: delete upload entries that do not exist in space

  function deleteUpload(id: string): void {
    backend
      .deleteUpload(id)
      .then(() => {
        setUploads(uploads.filter((u) => u.id !== id));
      })
      .catch((error) => setError(error.response.data.message));
  }

  function deleteJob(id: string): void {
    backend
      .deleteJob(id)
      .then(() => {
        setJobs(jobs.filter((j) => j.object_id !== id));
      })
      .catch((error) => setError(error.response.data.message));
  }

  async function deleteAllUploads(): Promise<void> {
    uploads.reduce((prev, arg) => prev.then(() => deleteUpload(arg.id)), Promise.resolve());
    setIsDeletingAll(false);
  }

  return (
    <Container>
      {jobs && jobs.length > 0 && (
        <div className="">
          <h2 className="title is-2">Active Jobs</h2>
          <div className="is-pulled-right">
            <button
              type="button"
              onClick={() => { window.location.href = '/uploads/mine'; }}
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
      )}

      <h2 className="title is -2">Uploads</h2>
      {uploads.length === 0 && !loading && (
        <p>
          You have no uploads! Make some from the
          {' '}
          <u>
            <a href="/search">search</a>
          </u>
          {' '}
          page.
        </p>
      )}
      {uploads.length > 0 && (
        <>
          {uploads
            && uploads.map((u) => (
              <UploadObjectEntry
                size={u.size_mb ? u.size_mb.toFixed('2') : 0}
                key={u.key}
                title={u.filename}
                icon={null}
                url={`/download/u/${u.key}`}
                deleteUpload={() => deleteUpload(u.key)}
              />
            ))}
          <hr />
          {!isPatreon && (
            <div className="card">
              <header className="card-header" />
              <div className="card-content">
                You have used
                {' '}
                {quota.toFixed(2)}
                {' '}
                MB
                {!isPatreon && ' of your quota (21MB)'}
                .
                <div className="is-pulled-right my-2">
                  <button
                    type="button"
                    className={`button is-small ${
                      deletingAll ? 'is-loading' : ''
                    } `}
                    onClick={() => {
                      setIsDeletingAll(true);
                      deleteAllUploads();
                    }}
                  >
                    Delete All
                  </button>
                </div>
                <progress
                  className={`progress ${quota > 16 ? 'is-danger' : 'is-info'}`}
                  value={quota}
                  max={21}
                >
                  15%
                </progress>
              </div>
              <div className="box">
                <div className="content">
                  <h2>Imposed limitations</h2>
                  <p>
                    We have set quota limits on non-patrons to avoid increasing
                    server load. The limitations are:
                  </p>
                  <ul>
                    <li>
                      You can only make conversions totalling 21MB but this is
                      not permanent. You can for example delete previous uploads
                      to reclaim your space when using it all up.
                    </li>
                    <li>
                      You can only convert at most 21 subpages (applies to
                      database entries as well) per conversion job.
                    </li>
                    <li>
                      Max 1 conversion job but you can start new ones as soon as
                      the last one is completed.
                    </li>
                    <li>You can only load 21 blocks total per page.</li>
                  </ul>
                  <p>
                    If you want the limits removed you can do so by becoming a
                    patron and they will removed for your account.
                  </p>
                </div>
                <BecomeAPatron />
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default ListUploadsPage;
