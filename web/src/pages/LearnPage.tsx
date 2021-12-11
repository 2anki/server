import { useState, useEffect } from "react";
import styled from "styled-components";
import Backend from "../lib/Backend";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 80vh;
`;

const backend = new Backend();
const LearnPage = () => {
  const [parentId, setParentId] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState(null);
  const [block, setBlock] = useState(null);
  const [grandChild, setGrandChild] = useState(null);
  let [location, setLocation] = useState(0);

  // Load parent page based on id
  useEffect(() => {
    const paths = window.location.pathname.split("/");
    let lastPath = paths[paths.length - 1];
    setParentId(lastPath);
  }, []);

  // Get the page meta data
  useEffect(() => {
    if (parentId) {
      console.log("parentId", parentId);
      backend
        .getPage(parentId)
        .then((response) => {
          console.log("response", response);
          setPage(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [parentId]);

  useEffect(() => {
    if (page) {
      backend.getBlocks(page.id).then((response) => {
        console.log("response", response);
        setChildren(response.results);
      });
    }
  }, [page]);

  useEffect(() => {
    setBlock(children[location]);
  }, [children, location]);

  useEffect(() => {
    if (block) {
      backend.getBlocks(block.id).then((response) => {
        console.log("response", response);
        setGrandChild(response.results);
      });
    }
  }, [block]);

  if (!parentId || !children) {
    return <div>insert loading screen.</div>;
  }
  return (
    <Wrapper onKeyDown={console.log}>
      {page && (
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li>
              <a href={page.url}>{page.title}</a>
            </li>
          </ul>
        </nav>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {block && (
          <>
            <h1 className="title">{block.id}</h1>
            <pre>{JSON.stringify(block, null, 4)}</pre>
            <hr />
            <pre>{JSON.stringify(grandChild, null, 2)}</pre>
          </>
        )}
        <progress
          onClick={() => {
            setLocation(location + 1);
          }}
          id="file"
          value={location + 1}
          max={children.length}
        ></progress>
        <span style={{ fontSize: "11px" }}>
          {location + 1} / {children.length}
        </span>
      </div>
    </Wrapper>
  );
};

export default LearnPage;
