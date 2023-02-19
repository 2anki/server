import React from 'react';
import { StyledNavbarItem } from './styled';

export interface NavbarItemProps {
  path: string;
  href: string;
  // eslint-disable-next-line react/require-default-props
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
}

export default function NavbarItem({
                                     path,
                                     href,
                                     onClick,
                                     children
                                   }: NavbarItemProps) {
  return (
    <StyledNavbarItem
      onClick={onClick}
      href={href}
      className={`navbar-item ${path === href ? 'has-text-weight-bold' : ''}`}
    >
      {children}
    </StyledNavbarItem>
  );
}
