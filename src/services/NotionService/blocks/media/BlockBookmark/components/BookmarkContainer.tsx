import { ReactNode } from 'react';

interface Prop {
  url: string;
  children: ReactNode;
}

export const BookmarkContainer = ({ url, children }: Prop) => {
  return (
    <a style={{ margin: '4px' }} href={url} className="bookmark source">
      {children}
    </a>
  );
};
