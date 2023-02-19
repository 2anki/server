import React, { ReactNode } from 'react';

export interface SidebarItemProps {
  path: string;
  href: string;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function SidebarItem({
                                      path,
                                      href,
                                      children,
                                      onClick
                                    }: SidebarItemProps) {
  return (
    <li>
      <a
        onClick={onClick}
        className={`${path === href ? 'has-text-weight-bold is-active' : ''}`}
        href={href}
      >
        {children}
      </a>
    </li>
  );
}
