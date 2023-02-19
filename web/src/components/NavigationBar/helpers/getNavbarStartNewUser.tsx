import NavbarItem from '../NavbarItem';

export default function getNavbarStartNewUser(hash: string, path: string) {
  return (
    <>
      <NavbarItem href="/" path={hash || path}>
        Home
      </NavbarItem>
      <NavbarItem href="/#about" path={hash}>
        About
      </NavbarItem>
      <NavbarItem href="/#testimony" path={hash}>
        Testimony
      </NavbarItem>
      <NavbarItem href="/#benefits" path={hash}>
        Benefits
      </NavbarItem>
      <NavbarItem href="/#news" path={hash}>
        News
      </NavbarItem>
    </>
  );
}
