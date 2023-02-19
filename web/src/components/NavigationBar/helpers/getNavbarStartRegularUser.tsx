import NavbarItem from '../NavbarItem';

export default function getNavbarStartRegularUser(path: string) {
  return (
    <>
      <NavbarItem href="/upload" path={path}>
        📦 Upload
      </NavbarItem>
      <NavbarItem href="/uploads/mine" path={path}>
        🗂 My Uploads
      </NavbarItem>
      <NavbarItem href="/favorites" path={path}>
        ⭐️Favorites
      </NavbarItem>
    </>
  );
}
