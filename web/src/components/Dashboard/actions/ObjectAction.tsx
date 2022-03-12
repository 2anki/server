import { MouseEventHandler } from 'react';

interface ObjectActionProps {
  url: string,
  image: string,
  onClick: MouseEventHandler,
}

export default function ObjectAction({ url, image, onClick }: ObjectActionProps) {
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={onClick}>
      <img alt="Page action" width="32px" src={image} />
    </a>
  );
}
