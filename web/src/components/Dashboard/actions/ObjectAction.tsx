import React from 'react';

interface ObjectActionProps {
  url: string,
  image: string,
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

export default function ObjectAction({ url, image, onClick }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={onClick}>
      <img alt="Page action" width="32px" src={image} />
    </a>
  );
}
