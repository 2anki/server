import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocsSidebar } from './DocsSidebar';
import { DocContent } from './DocContent';
import { DocsHome } from './DocsHome';
import { WipBanner } from './WipBanner';
import styles from './DocsPage.module.css';

function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.codePointAt(end - 1) === 47) end--;
  return end === value.length ? value : value.slice(0, end);
}

export default function DocsPage() {
  const params = useParams();
  const slug = stripTrailingSlashes(params['*'] ?? '');
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.layout}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-controls="docs-sidebar"
      >
        {menuOpen ? 'Close menu' : 'Menu'}
      </button>

      <aside
        id="docs-sidebar"
        className={`${styles.sidebarWrapper} ${
          menuOpen ? styles.sidebarOpen : ''
        }`}
      >
        <DocsSidebar onNavigate={closeMenu} />
      </aside>

      <main className={styles.main}>
        <WipBanner />
        {slug ? <DocContent slug={slug} /> : <DocsHome />}
      </main>
    </div>
  );
}
