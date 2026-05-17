import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MonthlyLimitBanner } from './MonthlyLimitBanner';

const BEFORE = new Date(Date.UTC(2026, 4, 15));
const AFTER = new Date(Date.UTC(2026, 5, 2));

function renderWith(props: { isPaying: boolean; now: Date }) {
  return render(
    <MemoryRouter>
      <MonthlyLimitBanner isPaying={props.isPaying} now={props.now} />
    </MemoryRouter>
  );
}

describe('MonthlyLimitBanner', () => {
  it('renders the announcement for free users before the enforcement date', () => {
    renderWith({ isPaying: false, now: BEFORE });
    expect(
      screen.getByText(/100 cards per month, starting 1 June/)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See plans' })).toHaveAttribute(
      'href',
      '/pricing?from=banner'
    );
  });

  it('hides itself for paying users', () => {
    const { container } = renderWith({ isPaying: true, now: BEFORE });
    expect(container).toBeEmptyDOMElement();
  });

  it('hides itself once the enforcement date has passed', () => {
    const { container } = renderWith({ isPaying: false, now: AFTER });
    expect(container).toBeEmptyDOMElement();
  });
});
