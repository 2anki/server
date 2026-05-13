import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { OcclusionCanvas } from './OcclusionCanvas';
import { ImageEntry } from '../types';

function makeEntry(overrides: Partial<ImageEntry> = {}): ImageEntry {
  return {
    id: 'entry-test',
    file: new File(['x'], 'test.jpg', { type: 'image/jpeg' }),
    header: '',
    rects: [],
    previewUrl: 'blob:fake',
    ...overrides,
  };
}


describe('OcclusionCanvas', () => {
  it('renders the image', () => {
    const { getByRole } = render(
      <OcclusionCanvas entry={makeEntry()} onRectsChange={vi.fn()} />
    );
    expect(getByRole('img')).toBeTruthy();
  });

  it('renders existing rects as SVG rect elements', () => {
    const entry = makeEntry({
      rects: [{ id: 'r1', x: 0.1, y: 0.1, w: 0.2, h: 0.2, label: '' }],
    });
    const { container } = render(
      <OcclusionCanvas entry={entry} onRectsChange={vi.fn()} />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(1);
  });

  it('does not finalize a rect smaller than 10px in width', () => {
    const onRectsChange = vi.fn();
    const { container } = render(
      <OcclusionCanvas entry={makeEntry()} onRectsChange={onRectsChange} />
    );
    const svg = container.querySelector('svg')!;
    svg.getBoundingClientRect = () => ({
      left: 0, top: 0, right: 500, bottom: 400, width: 500, height: 400, x: 0, y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(svg, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(svg, { clientX: 15, clientY: 10 });
    fireEvent.pointerUp(svg, { clientX: 15, clientY: 10 });

    expect(onRectsChange).not.toHaveBeenCalled();
  });

  it('does not finalize a rect smaller than 10px in height', () => {
    const onRectsChange = vi.fn();
    const { container } = render(
      <OcclusionCanvas entry={makeEntry()} onRectsChange={onRectsChange} />
    );
    const svg = container.querySelector('svg')!;
    svg.getBoundingClientRect = () => ({
      left: 0, top: 0, right: 500, bottom: 400, width: 500, height: 400, x: 0, y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(svg, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(svg, { clientX: 10, clientY: 15 });
    fireEvent.pointerUp(svg, { clientX: 10, clientY: 15 });

    expect(onRectsChange).not.toHaveBeenCalled();
  });

  it('shows label input when a rect is selected', () => {
    const entry = makeEntry({
      rects: [{ id: 'r1', x: 0.1, y: 0.1, w: 0.5, h: 0.5, label: 'Heart' }],
    });
    const { container, getByRole } = render(
      <OcclusionCanvas entry={entry} onRectsChange={vi.fn()} />
    );
    const rectEl = container.querySelector('[data-rect]')!;
    fireEvent.click(rectEl);
    const input = getByRole('textbox', { name: /Rect label/ });
    expect(input).toBeTruthy();
  });

  it('calls onRectsChange when Delete key pressed with selected rect', () => {
    const entry = makeEntry({
      rects: [{ id: 'r1', x: 0.1, y: 0.1, w: 0.5, h: 0.5, label: '' }],
    });
    const onRectsChange = vi.fn();
    const { container } = render(
      <OcclusionCanvas entry={entry} onRectsChange={onRectsChange} />
    );
    const rectEl = container.querySelector('[data-rect]')!;
    fireEvent.click(rectEl);

    const appEl = container.querySelector('[role="application"]')!;
    fireEvent.keyDown(appEl, { key: 'Delete' });

    expect(onRectsChange).toHaveBeenCalledWith([]);
  });

});
