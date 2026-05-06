import React, { ReactNode } from 'react';

export interface SidebarItemProps {
  path: string;
  href: string;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  target?: string,
}

export default function SidebarItem({
                                      target,
                                      path,
                                      href,
                                      children,
                                      onClick
                                    }: SidebarItemProps) {
  return (
    <li>
      <a
        target={target ?? '_self'}
        onClick={onClick}
        className={`${path === href ? 'has-text-weight-bold is-active' : ''}`}
        href={href}
      >
        {children}
      </a>
    </li>
  );
}
