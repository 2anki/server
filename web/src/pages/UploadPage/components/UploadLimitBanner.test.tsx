import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

import { UploadLimitBanner } from './UploadLimitBanner';

function renderBanner(props: {
  filename: string | null;
  isAnonymous: boolean;
  onDismiss?: () => void;
}) {
  return render(
    <MemoryRouter>
      <UploadLimitBanner
        filename={props.filename}
        isAnonymous={props.isAnonymous}
        onDismiss={props.onDismiss ?? vi.fn()}
      />
    </MemoryRouter>
  );
}

describe('UploadLimitBanner', () => {
  it('shows sign-up CTA for anonymous users', () => {
    renderBanner({ filename: 'notes.zip', isAnonymous: true });
    const link = screen.getByRole('link', { name: /sign up to download/i });
    expect(link).toHaveAttribute('href', '/register?redirect=/upload');
  });

  it('shows upgrade CTA for logged-in users', () => {
    renderBanner({ filename: 'notes.zip', isAnonymous: false });
    const link = screen.getByRole('link', { name: /upgrade to continue/i });
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('displays the filename when provided', () => {
    renderBanner({ filename: 'my-deck.html', isAnonymous: true });
    expect(screen.getByText('my-deck.html')).toBeInTheDocument();
  });

  it('omits filename element when null', () => {
    renderBanner({ filename: null, isAnonymous: false });
    expect(screen.queryByText(/\.html|\.zip/)).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    renderBanner({ filename: 'notes.zip', isAnonymous: true, onDismiss });
    fireEvent.click(
      screen.getByRole('button', { name: /try a different file/i })
    );
    expect(onDismiss).toHaveBeenCalled();
  });

  it('has an alert role for accessibility', () => {
    renderBanner({ filename: null, isAnonymous: true });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
