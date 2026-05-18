import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PassCards } from './PassCards';

describe('PassCards', () => {
  it('renders Day Pass button', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Get Day Pass' })).toBeInTheDocument();
  });

  it('renders Week Pass details element closed by default', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    const weekPassSummary = screen.getByText('Week Pass $9');
    const detailsEl = weekPassSummary.closest('details');
    expect(detailsEl).not.toHaveAttribute('open');
  });

  it('opens Week Pass details element after clicking summary', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    const weekPassSummary = screen.getByText('Week Pass $9');
    fireEvent.click(weekPassSummary);
    const detailsEl = weekPassSummary.closest('details');
    expect(detailsEl).toHaveAttribute('open');
  });

  it('calls onDayPass when Get Day Pass is clicked', () => {
    const onDayPass = vi.fn();
    render(
      <PassCards
        onDayPass={onDayPass}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Get Day Pass' }));
    expect(onDayPass).toHaveBeenCalledOnce();
  });

  it('calls onWeekPass when Get Week Pass is clicked after expanding', () => {
    const onWeekPass = vi.fn();
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={onWeekPass}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    fireEvent.click(screen.getByText('Week Pass $9'));
    fireEvent.click(screen.getByRole('button', { name: 'Get Week Pass' }));
    expect(onWeekPass).toHaveBeenCalledOnce();
  });

  it('disables the Day Pass button when dayPassPending', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={true}
        weekPassPending={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Redirecting…' })).toBeDisabled();
  });

  it('disables the Week Pass button when weekPassPending after expanding', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={true}
      />
    );
    fireEvent.click(screen.getByText('Week Pass $9'));
    expect(screen.getByRole('button', { name: 'Redirecting…' })).toBeDisabled();
  });

  it('renders correct pricing for Day Pass', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getByText('$4')).toBeInTheDocument();
  });

  it('shows Pay once badges on the pass cards', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getAllByText('Pay once').length).toBeGreaterThanOrEqual(1);
  });
});
