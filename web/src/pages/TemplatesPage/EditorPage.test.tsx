import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EditorPage from './EditorPage';
import * as templatesApi from '../../lib/backend/templates';
import { NoteTypeStarter } from '../../lib/backend/templates';

vi.mock('./components/CodeEditor/CodeEditor', () => ({
  CodeEditor: ({
    value,
    onChange,
    ariaLabel,
  }: {
    value: string;
    onChange: (next: string) => void;
    ariaLabel: string;
  }) => (
    <textarea
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
  default: () => null,
}));

const sampleStarter: NoteTypeStarter = {
  id: 'basic-clean',
  name: 'Clean Basic',
  description: 'A minimal note type',
  baseType: 'basic',
  noteType: {
    id: 1,
    name: 'Clean Basic',
    type: 0,
    tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
    flds: [
      { name: 'Front', ord: 0 },
      { name: 'Back', ord: 1 },
    ],
    css: '.card { color: black; }',
  },
  previewData: { Front: 'Q', Back: 'A' },
  tags: [],
};

function renderEditor(mode: 'new' | 'edit', initialEntry: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/templates/new" element={<EditorPage mode={mode} />} />
          <Route
            path="/templates/edit/:id"
            element={<EditorPage mode={mode} />}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('EditorPage (new)', () => {
  beforeEach(() => {
    vi.spyOn(templatesApi, 'saveUserTemplate').mockResolvedValue({
      templates: [],
      hiddenIds: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a Basic starter by default', async () => {
    renderEditor('new', '/templates/new');
    expect(
      await screen.findByRole('textbox', { name: /template name/i })
    ).toHaveValue('My Basic');
  });

  it('switches the base type when Cloze is selected', async () => {
    renderEditor('new', '/templates/new');
    await screen.findByRole('textbox', { name: /template name/i });
    fireEvent.click(screen.getByRole('button', { name: 'Cloze' }));
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /template name/i })
      ).toHaveValue('My Cloze');
    });
  });

  it('renders the three tabs', async () => {
    renderEditor('new', '/templates/new');
    await screen.findByRole('textbox', { name: /template name/i });
    expect(screen.getByRole('tab', { name: 'Front' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Styling' })).toBeInTheDocument();
  });

  it('saves a new template via saveUserTemplate', async () => {
    const save = vi
      .spyOn(templatesApi, 'saveUserTemplate')
      .mockResolvedValue({ templates: [], hiddenIds: [] });
    renderEditor('new', '/templates/new');

    await screen.findByRole('textbox', { name: /template name/i });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(save).toHaveBeenCalledTimes(1);
    });
    expect(save.mock.calls[0][0].name).toBe('My Basic');
  });
});

describe('EditorPage (edit)', () => {
  beforeEach(() => {
    vi.spyOn(templatesApi, 'getDefaultNoteTypes').mockResolvedValue([
      sampleStarter,
    ]);
    vi.spyOn(templatesApi, 'getUserTemplates').mockResolvedValue({
      templates: [],
      hiddenIds: [],
    });
    vi.spyOn(templatesApi, 'saveUserTemplate').mockResolvedValue({
      templates: [],
      hiddenIds: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads an existing starter and shows its name', async () => {
    renderEditor('edit', `/templates/edit/${sampleStarter.id}`);
    expect(
      await screen.findByDisplayValue('Clean Basic')
    ).toBeInTheDocument();
  });

  it('shows "Save as copy" when editing a default (not owned)', async () => {
    renderEditor('edit', `/templates/edit/${sampleStarter.id}`);
    expect(
      await screen.findByRole('button', { name: /save as copy/i })
    ).toBeInTheDocument();
  });

  it('shows "Save" when editing a user-owned template', async () => {
    vi.spyOn(templatesApi, 'getUserTemplates').mockResolvedValue({
      templates: [sampleStarter],
      hiddenIds: [],
    });
    renderEditor('edit', `/templates/edit/${sampleStarter.id}`);
    expect(
      await screen.findByRole('button', { name: /^save$/i })
    ).toBeInTheDocument();
  });

  it('shows a not-found message when the id is missing', async () => {
    vi.spyOn(templatesApi, 'getDefaultNoteTypes').mockResolvedValue([]);
    renderEditor('edit', '/templates/edit/missing-id');
    expect(await screen.findByText(/template not found/i)).toBeInTheDocument();
  });
});
