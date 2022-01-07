import { useEffect, useState } from "react";
import Container from "../components/Container";
import UploadObjectEntry from "../components/Dashboard/UploadObjectEntry";
import LoadingScreen from "../components/LoadingScreen";
import Backend from "../lib/Backend";

let backend = new Backend();
const ListUploadsPage = () => {
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
          let diskUsage = res
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
      .catch((err) => console.error(console.error(err)));
  }

  async function deleteAllUploads(): Promise<void> {
    for (const u of uploads) {
      await deleteUpload(u.key);
    }
    setIsDeletingAll(false);
  }

  return (
    <Container>
      {jobs && jobs.length > 0 && (
        <div className="">
          <h2 className="title is-2">Active Jobs</h2>
          <div
            className="is-pulled-right"
            onClick={() => (window.location.href = "/uploads/mine")}
          >
            <button className="button">Refresh</button>
          </div>
          <ul>
            {jobs.map((j) => (
              <li>
                <span className="tag mx-2">{j.status}</span>
                {j.object_id}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="title is -2">Uploads</h2>
      {uploads.length === 0 && !loading && (
        <>
          <p>
            You have no uploads! Make some from the{" "}
            <u>
              <a href="/search">search</a>
            </u>{" "}
            page.
          </p>
        </>
      )}
      {uploads.length > 0 && (
        <>
          {uploads &&
            uploads.map((u) => (
              <UploadObjectEntry
                size={u.size_mb ? u.size_mb.toFixed("2") : 0}
                key={u.key}
                title={u.filename}
                icon={null}
                url={`/download/u/${u.key}`}
                id={u.object_id}
                deleteUpload={() => deleteUpload(u.key)}
              />
            ))}
          <hr />
          {!isPatreon && (
            <div className="card">
              <header className="card-header"></header>
              <div className="card-content">
                You have used {quota.toFixed(2)} MB
                {!isPatreon && " of your quota (21MB)"}.
                <div className="is-pulled-right my-2">
                  <button
                    className={`button is-small ${
                      deletingAll ? "is-loading" : ""
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
                  className={`progress ${quota > 16 ? "is-danger" : "is-info"}`}
                  value={quota}
                  max={21}
                >
                  15%
                </progress>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ListUploadsPage;
