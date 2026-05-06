import { NavLink } from 'react-router-dom';
import { sidebar } from './sidebar';
import styles from './DocsPage.module.css';

interface DocsSidebarProps {
  onNavigate?: () => void;
}

export function DocsSidebar({ onNavigate }: Readonly<DocsSidebarProps>) {
  return (
    <nav className={styles.sidebar} aria-label="Documentation">
      {sidebar.map((group) => (
        <div key={group.label} className={styles.sidebarGroup}>
          <div className={styles.sidebarGroupLabel}>{group.label}</div>
          <ul className={styles.sidebarList}>
            {group.items.map((item) => (
              <li key={item.slug}>
                {item.href ? (
                  <a href={item.href} className={styles.sidebarLink}>
                    {item.label}
                  </a>
                ) : (
                  <NavLink
                    to={`/documentation/${item.slug}`}
                    className={({ isActive }) =>
                      `${styles.sidebarLink} ${
                        isActive ? styles.sidebarLinkActive : ''
                      }`
                    }
                    onClick={onNavigate}
                    end
                  >
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
