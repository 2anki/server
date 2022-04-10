import styled from 'styled-components';

const JoinNowButton = styled.a`
    border-radius: 10px;
    background: #2B2E3C;
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
