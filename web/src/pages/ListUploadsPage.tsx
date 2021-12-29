import { useEffect, useState } from "react";
import Container from "../components/Container";
import LoadingScreen from "../components/LoadingScreen";
import Backend from "../lib/Backend";
import UserUpload from "../lib/interfaces/UserUpload";

let backend = new Backend();
const ListUploadsPage = () => {
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [deletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    if (loading) {
      backend.getUploads().then((res) => {
        setUploads(res);
        setLoading(false);
      });
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
      <h1 className="title is -1">Uploads</h1>
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
        <table className="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Filename</th>
              <th>
                <>
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
                </>
              </th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u: UserUpload) => (
              <tr key={u.key}>
                <td>{u.key}</td>
                <td>
                  <a
                    rel="noreferrer"
                    target="_blank"
                    href={`/download/u/${u.key}`}
                  >
                    {u.filename}
                  </a>
                </td>
                <td>
                  <button
                    className="delete"
                    onClick={() => deleteUpload(u.key)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
  );
};

export default ListUploadsPage;
