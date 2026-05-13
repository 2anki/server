import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CardOptionsRow from './CardOptionsRow';

function renderRow(onOpen = vi.fn()) {
  return render(
    <MemoryRouter>
      <CardOptionsRow onOpen={onOpen} />
    </MemoryRouter>
  );
}

describe('CardOptionsRow', () => {
  it('renders the card options label', () => {
    renderRow();
    expect(screen.getByText('Card options')).toBeInTheDocument();
  });

  it('renders the default summary text', () => {
    renderRow();
    expect(screen.getByText('Using defaults')).toBeInTheDocument();
  });

  it('renders the Change action', () => {
    renderRow();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('calls onOpen when the row link is clicked', () => {
    const onOpen = vi.fn();
    renderRow(onOpen);
    fireEvent.click(screen.getByRole('link', { name: /card and deck options/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('links to the template view', () => {
    renderRow();
    const link = screen.getByRole('link', { name: /card and deck options/i });
    expect(link.getAttribute('href')).toContain('view=template');
  });
});
