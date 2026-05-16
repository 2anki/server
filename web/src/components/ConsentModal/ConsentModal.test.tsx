import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ConsentModal from './ConsentModal';

vi.mock('../../lib/backend/api', () => ({
  post: vi.fn(),
}));

import { post } from '../../lib/backend/api';
const mockPost = post as ReturnType<typeof vi.fn>;

describe('ConsentModal', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('renders the consent heading', () => {
    render(<ConsentModal onAccept={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Chat sends your messages to Anthropic' })).toBeInTheDocument();
  });

  it('renders the body copy', () => {
    render(<ConsentModal onAccept={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText(/Your messages and any files you attach go to Anthropic/)).toBeInTheDocument();
  });

  it('renders the primary Start chatting button', () => {
    render(<ConsentModal onAccept={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Start chatting' })).toBeInTheDocument();
  });

  it('renders the secondary Not now button', () => {
    render(<ConsentModal onAccept={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument();
  });

  it('POSTs to /api/chat/consent and calls onAccept when primary button is clicked', async () => {
    mockPost.mockResolvedValueOnce({ ok: true, status: 204 });
    const onAccept = vi.fn();
    render(<ConsentModal onAccept={onAccept} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start chatting' }));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/chat/consent', {});
      expect(onAccept).toHaveBeenCalled();
    });
  });

  it('calls onDismiss when Not now is clicked', () => {
    const onDismiss = vi.fn();
    render(<ConsentModal onAccept={vi.fn()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('disables Start chatting button while posting', async () => {
    let resolve!: (v: unknown) => void;
    mockPost.mockReturnValueOnce(new Promise((res) => { resolve = res; }));
    render(<ConsentModal onAccept={vi.fn()} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start chatting' }));
    expect(screen.getByRole('button', { name: 'Start chatting' })).toBeDisabled();
    resolve({ ok: true, status: 204 });
  });
});
