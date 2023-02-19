import styled from 'styled-components';
import React from 'react';

const JoinNowButton = styled.a`
  border-radius: 10px;
  background: #2b2e3c;
  color: white;
  border: none;

  :hover {
    color: white;
    background: #5397f5;
  }
`;

interface NavButtonCTAProps {
  href: string;
  children: React.ReactNode;
}

function NavButtonCTA({ href, children }: NavButtonCTAProps) {
  return (
    <JoinNowButton href={href} className="button">
      {children}
    </JoinNowButton>
  );
}

export default NavButtonCTA;
