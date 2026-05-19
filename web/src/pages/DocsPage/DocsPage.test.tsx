import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import DocsPage from './DocsPage';

vi.mock('./DocContent', () => ({
  DocContent: ({ slug }: { slug: string }) => <div>doc-content:{slug}</div>,
}));
vi.mock('./DocsHome', () => ({
  DocsHome: () => <div>docs-home</div>,
}));
vi.mock('./DocsSidebar', () => ({
  DocsSidebar: () => <nav>sidebar</nav>,
}));
vi.mock('./DocsDrawer', () => ({
  DocsDrawer: () => null,
}));

const WIP_TEXT = /These docs are being rewritten with help from AI/;

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/documentation/*" element={<DocsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DocsPage', () => {
  it('shows the WIP banner on the docs home', () => {
    renderAt('/documentation');
    expect(screen.getByText(WIP_TEXT)).toBeInTheDocument();
  });

  it('shows the WIP banner on a regular doc page', () => {
    renderAt('/documentation/start-here/connect-notion');
    expect(screen.getByText(WIP_TEXT)).toBeInTheDocument();
  });

  it('hides the WIP banner on the privacy policy page', () => {
    renderAt('/documentation/reference/privacy');
    expect(screen.queryByText(WIP_TEXT)).not.toBeInTheDocument();
  });

  it('hides the WIP banner on the terms of service page', () => {
    renderAt('/documentation/reference/terms');
    expect(screen.queryByText(WIP_TEXT)).not.toBeInTheDocument();
  });

  it('hides the WIP banner even with a trailing slash on the legal slug', () => {
    renderAt('/documentation/reference/privacy/');
    expect(screen.queryByText(WIP_TEXT)).not.toBeInTheDocument();
  });
});
