import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImageQueue } from './ImageQueue';
import { ImageEntry } from '../types';

function makeEntry(i: number): ImageEntry {
  return {
    file: new File(['x'], `img${i}.jpg`, { type: 'image/jpeg' }),
    header: '',
    rects: [],
    previewUrl: `blob:fake-${i}`,
  };
}

function renderQueue(entries: ImageEntry[], isPaying: boolean) {
  return render(
    <MemoryRouter>
      <ImageQueue
        entries={entries}
        activeIndex={0}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onHeaderChange={vi.fn()}
        isPaying={isPaying}
      />
    </MemoryRouter>
  );
}

describe('ImageQueue', () => {
  it('shows the add button when under the free tier limit', () => {
    renderQueue([makeEntry(0), makeEntry(1)], false);
    expect(screen.getByText('+ Add images')).toBeTruthy();
  });

  it('hides the add button and shows upgrade notice at exactly the free tier limit', () => {
    const entries = [makeEntry(0), makeEntry(1), makeEntry(2)];
    renderQueue(entries, false);
    expect(screen.queryByText('+ Add images')).toBeNull();
    expect(screen.getByText(/Free accounts support up to 3 images/)).toBeTruthy();
  });

  it('shows the add button for paying users even at 3 images', () => {
    const entries = [makeEntry(0), makeEntry(1), makeEntry(2)];
    renderQueue(entries, true);
    expect(screen.getByText('+ Add images')).toBeTruthy();
    expect(screen.queryByText(/Free accounts/)).toBeNull();
  });

  it('shows the add button for paying users with many images', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeEntry(i));
    renderQueue(entries, true);
    expect(screen.getByText('+ Add images')).toBeTruthy();
  });

  it('shows upgrade link pointing to /pricing', () => {
    const entries = [makeEntry(0), makeEntry(1), makeEntry(2)];
    renderQueue(entries, false);
    const link = screen.getByRole('link', { name: /Upgrade/ });
    expect(link.getAttribute('href')).toBe('/pricing');
  });
});
