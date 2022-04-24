import NavbarItem from '../NavbarItem';

export default function getNavbarStartRegularUser(path: string) {
  /**
     * Coming soon
     * /learn
     * /import
     */
  return (
    <>
      <NavbarItem href="/upload" path={path}>
        📦 Upload
      </NavbarItem>
      <NavbarItem href="/uploads/mine" path={path}>
        🗂 My Uploads
      </NavbarItem>
      <NavbarItem href="/tm" path={path}>👩🏼‍🎨 Templates</NavbarItem>
    </>
  );
}
