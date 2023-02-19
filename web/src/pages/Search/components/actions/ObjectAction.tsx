/* eslint-disable react/require-default-props */
import { MouseEventHandler } from 'react';
import { ObjectIconAction } from '../SearchObjectEntry/styled';

export interface ObjectActionProps {
  url: string;
  image: string;
  onClick?: MouseEventHandler;
}

export default function ObjectAction({
                                       url,
                                       image,
                                       onClick
                                     }: ObjectActionProps) {
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={onClick}>
      <ObjectIconAction alt="Page action" width="32px" src={image} />
    </a>
  );
}
