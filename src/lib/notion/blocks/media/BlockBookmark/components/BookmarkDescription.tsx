import React from 'react';

interface Prop {
  description: string;
}

export function BookmarkDescription({ description }: Prop) {
  if (!description) {
    return null;
  }
  return <div className="bookmark-description">{description}</div>;
}
