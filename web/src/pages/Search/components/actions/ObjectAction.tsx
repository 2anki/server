import { MouseEventHandler } from 'react';
import { ObjectIconAction } from '../SearchObjectEntry/styled';

interface ObjectActionProps {
  url: string,
  image: string,
  // eslint-disable-next-line react/require-default-props
  onClick?: MouseEventHandler,
}

export default function ObjectAction({ url, image, onClick }: ObjectActionProps) {
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={onClick}>
      <ObjectIconAction alt="Page action" width="32px" src={image} />
    </a>
  );
}
