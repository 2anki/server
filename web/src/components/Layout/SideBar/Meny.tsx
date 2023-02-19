import SidebarItem from './SidebarItem';
import Backend from '../../../lib/backend';
import { goToLoginPage } from '../../../pages/Register/goToLoginPage';

const backend = new Backend();

export function Menu() {
  const path = window.location.pathname;
  return (
    <aside className="menu is-flex is-flex-direction-column is-justify-content-space-between is-fullheight"
           style={{ height: '100vh' }}>
      <ul className="menu-list">
        <SidebarItem path={path} href="/upload">
          📦 Upload
        </SidebarItem>
        <SidebarItem href="/uploads/mine" path={path}>
          🗂️ My uploads
        </SidebarItem>
        <SidebarItem path={path} href="/search">
          🔍 Search
        </SidebarItem>
        <SidebarItem path={path} href="/favorites">
          ⭐️ Favorites
        </SidebarItem>
      </ul>
      <ul className="menu-list">
        <hr />
        <SidebarItem path={path} href="/delete-account">
          🗑️ Delete account
        </SidebarItem>
        <SidebarItem path={path} href="https://discord.gg/PSKC3uS">
          👾 Discord
        </SidebarItem>
        <SidebarItem
          path={path}
          href="https://alemayhu.notion.site/FAQ-ef01be9c9bac41689a4d749127c14301"
        >
          🙋🏽‍♀️ FAQ
        </SidebarItem>
        <SidebarItem path={path}
                     href="/users/logout"
                     onClick={(event) => {
                       event.preventDefault();
                       backend.logout().then(() => goToLoginPage());
                     }}>
          🔒 log out
        </SidebarItem>
      </ul>
    </aside>
  );
}
