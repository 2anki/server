import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PassToggleCard } from './PassToggleCard';

describe('PassToggleCard', () => {
  it('defaults to 24-hour state with correct price and button label', () => {
    render(<PassToggleCard onCheckout={vi.fn()} pending={false} />);
    expect(screen.getByText('$4')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Get Day Pass' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Unlimited conversions for 24 hours. Pay once, no subscription.'
      )
    ).toBeInTheDocument();
  });

  it('swaps to week state when 1 week pill is clicked', () => {
    render(<PassToggleCard onCheckout={vi.fn()} pending={false} />);
    fireEvent.click(screen.getByRole('button', { name: '1 week' }));
    expect(screen.getByText('$9')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Get Week Pass' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Unlimited conversions for 1 week. Pay once, no subscription.'
      )
    ).toBeInTheDocument();
  });

  it('calls onCheckout with 24h when Get Day Pass is clicked', () => {
    const onCheckout = vi.fn();
    render(<PassToggleCard onCheckout={onCheckout} pending={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Get Day Pass' }));
    expect(onCheckout).toHaveBeenCalledWith('24h');
  });

  it('calls onCheckout with 7d when Get Week Pass is clicked', () => {
    const onCheckout = vi.fn();
    render(<PassToggleCard onCheckout={onCheckout} pending={false} />);
    fireEvent.click(screen.getByRole('button', { name: '1 week' }));
    fireEvent.click(screen.getByRole('button', { name: 'Get Week Pass' }));
    expect(onCheckout).toHaveBeenCalledWith('7d');
  });

  it('shows Redirecting… and disables the action button when pending', () => {
    render(<PassToggleCard onCheckout={vi.fn()} pending={true} />);
    const actionButton = screen.getByRole('button', { name: 'Redirecting…' });
    expect(actionButton).toBeDisabled();
  });

  it('has exactly one pill with aria-selected=true at a time in default state', () => {
    render(<PassToggleCard onCheckout={vi.fn()} pending={false} />);
    const selected = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent('24 hours');
  });

  it('has exactly one pill with aria-selected=true after switching to 1 week', () => {
    render(<PassToggleCard onCheckout={vi.fn()} pending={false} />);
    fireEvent.click(screen.getByRole('button', { name: '1 week' }));
    const selected = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent('1 week');
  });

  it('renders all four feature lines', () => {
    render(<PassToggleCard onCheckout={vi.fn()} pending={false} />);
    expect(screen.getByText('Unlimited conversions')).toBeInTheDocument();
    expect(
      screen.getByText(
        'All upload formats — Notion, .zip, .html, .md, .csv, .apkg'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Image occlusion')).toBeInTheDocument();
    expect(screen.getByText('Custom card templates')).toBeInTheDocument();
  });
});
