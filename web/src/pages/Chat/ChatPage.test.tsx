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
  postMultipart: vi.fn(),
  get: vi.fn().mockResolvedValue({ used: 0, limit: 20 }),
}));

import { post, get, postMultipart } from '../../lib/backend/api';

const mockPost = post as ReturnType<typeof vi.fn>;
const mockGet = get as ReturnType<typeof vi.fn>;
const mockPostMultipart = postMultipart as ReturnType<typeof vi.fn>;

function makeSseResponse(events: Array<{ event: string; data: unknown }>) {
  const encoder = new TextEncoder();
  const chunks = events.map(
    ({ event, data }) => encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  );
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
  return { ok: true, status: 200, body: stream };
}

describe('ChatPage', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockPostMultipart.mockReset();
    mockGet.mockResolvedValue({ used: 0, limit: 20 });
    mockPost.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);
  });

  it('renders the empty state heading', () => {
    render(<ChatPage />);
    expect(screen.getByRole('heading', { name: 'Chat' })).toBeInTheDocument();
  });

  it('renders CardPreview when assistant message has cards', async () => {
    const cards = [{ front: 'Q1', back: 'A1' }, { front: 'Q2', back: 'A2' }];
    mockPost.mockResolvedValueOnce(
      makeSseResponse([
        {
          event: 'done',
          data: {
            content: 'Here are cards:\n```json\n[]\n```\nDone!',
            contentBefore: 'Here are cards:',
            contentAfter: 'Done!',
            cards,
          },
        },
      ])
    );

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
    mockPost.mockResolvedValueOnce(
      makeSseResponse([
        { event: 'done', data: { content: 'Photosynthesis is the process...' } },
      ])
    );

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

  it('shows Building cards indicator and hides JSON while streaming cards', async () => {
    const cards = [{ front: 'Q1', back: 'A1' }];
    const encoder = new TextEncoder();
    let enqueue!: (chunk: Uint8Array) => void;
    let close!: () => void;
    const stream = new ReadableStream({
      start(controller) {
        enqueue = (c) => controller.enqueue(c);
        close = () => controller.close();
      },
    });
    mockPost.mockResolvedValueOnce({ ok: true, status: 200, body: stream });

    render(<ChatPage />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Message input' }), {
      target: { value: 'Make cards' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    enqueue(encoder.encode('event: token\ndata: "Here are your cards:"\n\n'));
    enqueue(encoder.encode('event: token\ndata: "\\n```json"\n\n'));
    enqueue(encoder.encode('event: token\ndata: "[{\\"front\\":\\"Q1\\",\\"back\\":\\"A1\\"}]"\n\n'));

    await waitFor(() => {
      expect(screen.getByText('Building cards')).toBeInTheDocument();
    });
    expect(screen.queryByText(/```json/)).not.toBeInTheDocument();

    enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({
      content: 'Here are your cards:\n```json\n[{"front":"Q1","back":"A1"}]\n```',
      contentBefore: 'Here are your cards:',
      cards,
    })}\n\n`));
    close();

    await waitFor(() => {
      expect(screen.getByText('Q1')).toBeInTheDocument();
    });
    expect(screen.queryByText('Building cards')).not.toBeInTheDocument();
  });

  it('does not collapse short user messages', async () => {
    render(<ChatPage />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Message input' }), {
      target: { value: 'Short message' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.queryByRole('button', { name: 'Show full message' })).not.toBeInTheDocument();
  });

  it('collapses long user messages and shows expand toggle', () => {
    render(<ChatPage />);
    const longContent = 'x'.repeat(601);
    fireEvent.change(screen.getByRole('textbox', { name: 'Message input' }), {
      target: { value: longContent },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByRole('button', { name: 'Show full message' })).toBeInTheDocument();
  });

  it('toggles long message between collapsed and expanded', () => {
    render(<ChatPage />);
    const longContent = 'x'.repeat(601);
    fireEvent.change(screen.getByRole('textbox', { name: 'Message input' }), {
      target: { value: longContent },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    const toggle = screen.getByRole('button', { name: 'Show full message' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.getByRole('button', { name: 'Show full message' })).toBeInTheDocument();
  });

  it('hydrates usage counter from server on mount', async () => {
    mockGet.mockResolvedValueOnce({ used: 5, limit: 20 });

    render(<ChatPage />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/chat/usage', { redirect: false });
    });
  });

  it('shows paperclip button in the composer', () => {
    render(<ChatPage />);
    expect(screen.getByRole('button', { name: 'Attach files' })).toBeInTheDocument();
  });

  it('shows chip when a valid file is attached via input', async () => {
    render(<ChatPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'lecture.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByTitle('lecture.pdf')).toBeInTheDocument();
    });
  });

  it('shows error when file type is not allowed', async () => {
    render(<ChatPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Can't attach document.docx/)).toBeInTheDocument();
    });
  });

  it('removes chip when the remove button is clicked', async () => {
    render(<ChatPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'notes.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByTitle('notes.pdf')).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole('button', { name: 'Remove notes.pdf' });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByTitle('notes.pdf')).not.toBeInTheDocument();
    });
  });

  it('uses postMultipart when files are attached', async () => {
    mockPostMultipart.mockResolvedValueOnce(
      makeSseResponse([
        { event: 'done', data: { content: 'Answer', conversationId: 1 } },
      ])
    );

    render(<ChatPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'slides.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByTitle('slides.pdf')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'Message input' }), {
      target: { value: 'Summarize this' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(mockPostMultipart).toHaveBeenCalledWith('/api/chat/message', expect.any(FormData));
    });
  });

  it('shows 1 message left special copy at limit minus one', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/api/chat/usage') return Promise.resolve({ used: 19, limit: 20 });
      return Promise.resolve({ conversations: [] });
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText('1 message left this month — your next send uses it')).toBeInTheDocument();
    });
  });
});
