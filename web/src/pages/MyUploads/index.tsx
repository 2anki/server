import BecomeAPatron from '../../components/BecomeAPatron';
import UploadObjectEntry from './components/UploadObjectEntry';
import LoadingScreen from '../../components/LoadingScreen';
import Backend from '../../lib/Backend';
import ActiveJobs from './components/ActiveJobs';

import useUploads from './hooks/useUploads';
import usePatreon from './hooks/usePatreon';
import useQuota from './hooks/useQuota';
import useActiveJobs from './hooks/useActiveJobs';
import { Container, PageContainer } from '../../components/styled';

const backend = new Backend();

interface MyUploadsPageProps {
  setError: (error: string) => void;
}

function MyUploadsPage({ setError }: MyUploadsPageProps) {
  const [
    loading, uploads, deleteUpload, deleteAllUploads,
    isDeletingAll,
  ] = useUploads(backend, setError);
  const [activeJobs, deleteJob] = useActiveJobs(backend, setError);
  const [isPatreon] = usePatreon(backend, setError);
  const [quota] = useQuota(uploads);

  if (loading) return <LoadingScreen />;

  return (
    <PageContainer>
      <Container>
        {activeJobs.length > 0 && (
          <ActiveJobs jobs={activeJobs} deleteJob={(id) => deleteJob(id)} />
        )}
        <h2 className="title is -2">My Uploads</h2>
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
                  size={`${u.size_mb ? u.size_mb.toFixed(2) : 0}`}
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
                        isDeletingAll ? 'is-loading' : ''
                      } `}
                      onClick={() => {
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
    </PageContainer>
  );
}

export default MyUploadsPage;
