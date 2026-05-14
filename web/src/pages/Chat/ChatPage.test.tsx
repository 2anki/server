import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ChatPage from './ChatPage';

window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock('../../lib/hooks/useUserLocals', () => ({
  useUserLocals: () => ({ data: { user: { patreon: false } } }),
}));

vi.mock('../../lib/backend/api', () => ({
  post: vi.fn(),
  get: vi.fn().mockResolvedValue({ used: 0, limit: 20 }),
}));

import { post, get } from '../../lib/backend/api';

const mockPost = post as ReturnType<typeof vi.fn>;
const mockGet = get as ReturnType<typeof vi.fn>;

describe('ChatPage', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockResolvedValue({ used: 0, limit: 20 });
  });

  it('renders the empty state heading', () => {
    render(<ChatPage />);
    expect(screen.getByRole('heading', { name: 'Chat' })).toBeInTheDocument();
  });

  it('renders CardPreview when assistant message has cards', async () => {
    const cards = [{ front: 'Q1', back: 'A1' }, { front: 'Q2', back: 'A2' }];
    mockPost.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        role: 'assistant',
        content: 'Here are cards:\n```json\n[]\n```\nDone!',
        contentBefore: 'Here are cards:',
        contentAfter: 'Done!',
        cards,
      }),
    });

    render(<ChatPage />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Message input' }), {
      target: { value: 'Make cards' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('Here are cards:')).toBeInTheDocument();
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });

  it('renders plain text for assistant message without cards', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        role: 'assistant',
        content: 'Photosynthesis is the process...',
      }),
    });

    render(<ChatPage />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Message input' }), {
      target: { value: 'Explain photosynthesis' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.getByText('Photosynthesis is the process...')).toBeInTheDocument();
    });

    expect(screen.queryByText('Save as deck')).not.toBeInTheDocument();
  });

  it('hydrates usage counter from server on mount', async () => {
    mockGet.mockResolvedValueOnce({ used: 5, limit: 20 });

    render(<ChatPage />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/chat/usage', { redirect: false });
    });
  });
});
