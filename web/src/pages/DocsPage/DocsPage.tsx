import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocsSidebar } from './DocsSidebar';
import { DocContent } from './DocContent';
import { DocsHome } from './DocsHome';
import { DocsDrawer } from './DocsDrawer';
import { WipBanner } from './WipBanner';
import styles from './DocsPage.module.css';

function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.codePointAt(end - 1) === 47) end--;
  return end === value.length ? value : value.slice(0, end);
}

const LEGAL_SLUGS = new Set(['reference/privacy', 'reference/terms']);

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
        onClick={() => setMenuOpen(true)}
        aria-expanded={menuOpen}
        aria-controls="docs-sidebar"
      >
        Menu
      </button>

      <aside
        id="docs-sidebar"
        className={styles.sidebarWrapper}
      >
        <DocsSidebar onNavigate={closeMenu} activeSlug={slug} />
      </aside>

      <DocsDrawer isOpen={menuOpen} onClose={closeMenu} activeSlug={slug} />

      <main
        className={styles.main}
        data-legal={LEGAL_SLUGS.has(slug) ? 'true' : undefined}
      >
        <WipBanner />
        {slug ? <DocContent slug={slug} /> : <DocsHome />}
      </main>
    </div>
  );
}
