import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../components/FeedbackWidget/FeedbackWidget', () => ({
  FeedbackWidget: () => null,
}));

vi.mock('./inProgress', () => ({
  inProgress: [
    { title: 'Item 1', startedAt: '2026-05-01T00:00:00Z' },
    { title: 'Item 2', startedAt: '2026-05-02T00:00:00Z' },
    { title: 'Item 3', startedAt: '2026-05-03T00:00:00Z' },
    { title: 'Item 4', startedAt: '2026-05-04T00:00:00Z' },
    { title: 'Item 5', startedAt: '2026-05-05T00:00:00Z' },
    { title: 'Item 6', startedAt: '2026-05-06T00:00:00Z' },
    { title: 'Item 7', startedAt: '2026-05-07T00:00:00Z' },
  ],
}));

vi.mock('./backlog', () => ({
  backlog: [],
}));

describe('WhatsNewPage in progress cap', () => {
  it('shows exactly 5 cards and "+ 2 more in the queue" when array has 7 entries', async () => {
    const { default: WhatsNewPage } = await import('./WhatsNewPage');
    render(
      <MemoryRouter>
        <WhatsNewPage />
      </MemoryRouter>
    );
    expect(screen.getByText('+ 2 more in the queue')).toBeInTheDocument();
    expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 7')).not.toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
  });
});
