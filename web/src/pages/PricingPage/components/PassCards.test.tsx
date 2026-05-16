import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PassCards } from './PassCards';

describe('PassCards', () => {
  it('renders Day Pass and Week Pass buttons', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Get Day Pass' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Week Pass' })).toBeInTheDocument();
  });

  it('shows picker helper copy', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getByText('Pick your pass')).toBeInTheDocument();
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

  it('calls onWeekPass when Get Week Pass is clicked', () => {
    const onWeekPass = vi.fn();
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={onWeekPass}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Get Week Pass' }));
    expect(onWeekPass).toHaveBeenCalledOnce();
  });

  it('shows Redirecting… and disables both buttons when dayPassPending', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={true}
        weekPassPending={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Redirecting…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Get Week Pass' })).toBeDisabled();
  });

  it('shows Redirecting… and disables both buttons when weekPassPending', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Get Day Pass' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Redirecting…' })).toBeDisabled();
  });

  it('renders all four feature-list items', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getAllByText('Unlimited conversions')).toHaveLength(2);
    expect(screen.getAllByText('Image occlusion')).toHaveLength(2);
    expect(screen.getAllByText('Custom card templates')).toHaveLength(2);
  });

  it('renders correct pricing for each pass', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getByText('$4')).toBeInTheDocument();
    expect(screen.getByText('$9')).toBeInTheDocument();
  });

  it('shows a Pay once badge on each card', () => {
    render(
      <PassCards
        onDayPass={vi.fn()}
        onWeekPass={vi.fn()}
        dayPassPending={false}
        weekPassPending={false}
      />
    );
    expect(screen.getAllByText('Pay once')).toHaveLength(2);
  });
});
