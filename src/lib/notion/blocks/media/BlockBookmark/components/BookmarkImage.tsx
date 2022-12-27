import React from 'react';

interface Prop {
  image: string;
}

export const BookmarkImage = ({ image }: Prop) => {
  if (!image) {
    return null;
  }
  return <img src={image} className="bookmark-image" />;
};
