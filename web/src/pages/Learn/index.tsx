import { useState, useEffect } from 'react';
import { Container, PageContainer } from '../../components/styled';
import Backend from '../../lib/Backend';
import Wrapper from './Wrapper';

interface Props {
  setError: (error: string) => void;
}

const backend = new Backend();
function LearnPage({ setError }: Props) {
  const [parentId, setParentId] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState(null);
  const [block, setBlock] = useState(null);
  const [grandChild, setGrandChild] = useState(null);
  const [location, setLocation] = useState(0);

  // Load parent page based on id
  useEffect(() => {
    const paths = window.location.pathname.split('/');
    const lastPath = paths[paths.length - 1];
    setParentId(lastPath);
    setLocation(1); // temporary until buttons / key presses are implemented
  }, []);

  // Get the page meta data
  useEffect(() => {
    if (parentId) {
      backend
        .getPage(parentId)
        .then((response) => {
          setPage(response);
        })
        .catch((error) => {
          setError(error.response.data.message);
        });
    }
  }, [parentId]);

  useEffect(() => {
    if (page) {
      backend.getBlocks(page.id).then((response) => {
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
        setGrandChild(response.results);
      });
    }
  }, [block]);

  if (!parentId || !children) {
    return <div>insert loading screen.</div>;
  }
  return (
    <PageContainer>
      <h1>Learn</h1>
      <Container>
        <Wrapper>
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
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
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
              id="file"
              value={location + 1}
              max={children.length}
            />
            <span style={{ fontSize: '11px' }}>
              {location + 1}
              {' '}
              /
              {children.length}
            </span>
          </div>
        </Wrapper>
      </Container>
    </PageContainer>
  );
}

export default LearnPage;
