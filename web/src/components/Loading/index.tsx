import { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import styled from 'styled-components';

const StyledLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  height: 100vh;
  width: 60vw;
  margin: 0 auto;
`;

export default function LoadingIndicator() {
  const [loading, setLoading] = useState<number>(0);
  useInterval(() => setLoading(loading + 1), 50);

  return (
    <StyledLoader>
      <button
        aria-label="loading"
        type="button"
        className="button is-loading is-light"
      />
    </StyledLoader>
  );
}
