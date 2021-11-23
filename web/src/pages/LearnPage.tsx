import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 80vh;
`;

const LearnPage = () => {
  const currentBlock = 32;
  const lastBlock = 100;

  return (
    <Wrapper onKeyDown={console.log}>
      <p>Coming soon</p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <progress id="file" value={currentBlock} max={lastBlock}></progress>
        <span style={{ fontSize: "11px" }}>
          {currentBlock} / {lastBlock}
        </span>
      </div>
    </Wrapper>
  );
};

export default LearnPage;
