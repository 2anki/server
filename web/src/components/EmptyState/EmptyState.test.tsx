import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EmptyState } from './EmptyState';

function renderEmptyState(props: Parameters<typeof EmptyState>[0]) {
  return render(
    <MemoryRouter>
      <EmptyState {...props} />
    </MemoryRouter>
  );
}

describe('EmptyState', () => {
  it('renders title', () => {
    renderEmptyState({ title: 'Nothing here' });
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    renderEmptyState({ icon: '📄', title: 'Empty' });
    expect(screen.getByText('📄')).toBeInTheDocument();
  });

  it('does not render icon when omitted', () => {
    const { container } = renderEmptyState({ title: 'Empty' });
    expect(container.querySelector('[class*="icon"]')).toBeNull();
  });

  it('renders description when provided', () => {
    renderEmptyState({ title: 'Empty', description: 'No items found.' });
    expect(screen.getByText('No items found.')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    const { container } = renderEmptyState({ title: 'Empty' });
    expect(container.querySelector('[class*="description"]')).toBeNull();
  });

  it('renders action link when both label and href are provided', () => {
    renderEmptyState({
      title: 'Empty',
      actionLabel: 'Get started',
      actionHref: '/start',
    });
    const link = screen.getByRole('link', { name: 'Get started' });
    expect(link).toHaveAttribute('href', '/start');
  });

  it('does not render action link when only label is provided', () => {
    renderEmptyState({ title: 'Empty', actionLabel: 'Get started' });
    expect(screen.queryByRole('link', { name: 'Get started' })).toBeNull();
  });

  it('does not render action link when only href is provided', () => {
    renderEmptyState({ title: 'Empty', actionHref: '/start' });
    expect(screen.queryByRole('link')).toBeNull();
  });
});
