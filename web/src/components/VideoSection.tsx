import styled from "styled-components";

const VideoContainer = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding: 2.5rem 1rem;

  /* Reponsive iframe: https://stackoverflow.com/questions/17838607/making-an-iframe-responsive */
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
  height: 0;
  iframe {
    padding-top: 1rem;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  /* end */
`;
const VideoSection: React.FC<{
  title: string;
  description: string;
  url: string;
}> = ({ title, description, url }) => {
  return (
    <>
      <h3>{title}</h3>
      <p>{description}</p>
      <VideoContainer>
        <iframe
          width="560"
          height="315"
          src={url}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </VideoContainer>
    </>
  );
};

export default VideoSection;
