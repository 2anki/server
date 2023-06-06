import React from 'react';

interface Prop {
  logo: string;
}

export const BookmarkLogo = ({ logo }: Prop) => {
  if (!logo) {
    return null;
  }
  return <img src={logo} className="icon bookmark-icon" />;
};
