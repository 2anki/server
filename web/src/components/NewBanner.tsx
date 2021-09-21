import styled from "styled-components";

const Banner = styled.div`
  z-index: 1;
  margin: 1rem;
  padding: 1rem;
  background: #5397f5;
  max-width: 256px;
  max-height: 256px;
  position: absolute;
  right: 0;
  color: white;
  border-radius: 0.5rem;

  h2 {
    font-weight: bold;
  }
  h3 {
    font-weight: bold;
  }
`;

const CTAButton = styled.div`
  background: white;
  font-weight: bold;
  border-radius: 0.2rem;
  margin-top: 0.5rem;
  display: inline-block;
  a {
    color: black;
    padding: 0.3rem 0.5rem;
  }
`;

const NewBanner = () => {
  if (window.location.pathname.match(/[login|register]/)) {
    return <></>;
  }
  return (
    <Banner>
      <h2>NEW!</h2>
      Automatic syncing between Notion and Anki.
      <div>
        <CTAButton>
          <a href="/pre-signup">Learn more</a>
        </CTAButton>
      </div>
    </Banner>
  );
};

export default NewBanner;
