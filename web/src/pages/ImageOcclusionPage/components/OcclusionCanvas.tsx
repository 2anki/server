import { useEffect, useRef, useState, useCallback } from 'react';
import { OcclusionRect, ImageEntry } from '../types';
import styles from '../ImageOcclusionPage.module.css';

interface Props {
  entry: ImageEntry;
  onRectsChange: (rects: OcclusionRect[]) => void;
}

interface DraftRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

type HandleDir = 'nw' | 'ne' | 'sw' | 'se';

interface DragState {
  type: 'move' | 'resize';
  handle?: HandleDir;
  rectId: string;
  startPx: number;
  startPy: number;
  startRect: OcclusionRect;
}

const MIN_NORM = 0.01;
const HANDLE_SIZE = 8;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toNorm(px: number, dim: number): number {
  return Math.max(0, Math.min(1, px / dim));
}

function clampRect(x: number, y: number, w: number, h: number): { x: number; y: number; w: number; h: number } {
  const cx = Math.max(0, Math.min(1 - MIN_NORM, x));
  const cy = Math.max(0, Math.min(1 - MIN_NORM, y));
  return { x: cx, y: cy, w: Math.max(MIN_NORM, Math.min(1 - cx, w)), h: Math.max(MIN_NORM, Math.min(1 - cy, h)) };
}

export function OcclusionCanvas({ entry, onRectsChange }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftRect | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setSelectedId(null);
    setDraft(null);
    setDrag(null);
  }, [entry.file]);

  const selectedRect = entry.rects.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    setLabelInput(selectedRect?.label ?? '');
  }, [selectedRect]);

  const getSvgPt = useCallback((e: React.PointerEvent | PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0, svgW: 1, svgH: 1 };
    const r = svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, svgW: r.width, svgH: r.height };
  }, []);

  const toNormPt = useCallback(
    (svgX: number, svgY: number, svgW: number, svgH: number) => ({
      nx: toNorm(svgX, svgW),
      ny: toNorm(svgY, svgH),
    }),
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const target = e.target as Element;
      const handleEl = target.closest('[data-handle]');
      const rectEl = target.closest('[data-rect]');

      if (handleEl) {
        const dir = handleEl.getAttribute('data-handle') as HandleDir;
        const rectId = handleEl.closest('[data-rect]')?.getAttribute('data-rect');
        if (!rectId) return;
        const rect = entry.rects.find((r) => r.id === rectId);
        if (!rect) return;
        e.stopPropagation();
        const { x, y } = getSvgPt(e);
        setDrag({ type: 'resize', handle: dir, rectId, startPx: x, startPy: y, startRect: { ...rect } });
        try { (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); } catch { /* jsdom */ }
        return;
      }

      if (rectEl) {
        const rectId = rectEl.getAttribute('data-rect');
        if (!rectId) return;
        const rect = entry.rects.find((r) => r.id === rectId);
        if (!rect) return;
        e.stopPropagation();
        setSelectedId(rectId);
        const { x, y } = getSvgPt(e);
        setDrag({ type: 'move', rectId, startPx: x, startPy: y, startRect: { ...rect } });
        try { (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); } catch { /* jsdom */ }
        return;
      }

      const { x, y } = getSvgPt(e);
      setDraft({ startX: x, startY: y, currentX: x, currentY: y });
      setSelectedId(null);
      try { (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); } catch { /* jsdom */ }
    },
    [entry.rects, getSvgPt]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (drag) {
        const { x, y, svgW, svgH } = getSvgPt(e);
        const dx = (x - drag.startPx) / svgW;
        const dy = (y - drag.startPy) / svgH;
        const sr = drag.startRect;

        let updated: OcclusionRect;
        if (drag.type === 'move') {
          const clamped = clampRect(sr.x + dx, sr.y + dy, sr.w, sr.h);
          updated = { ...sr, ...clamped };
        } else {
          const h = drag.handle!;
          let nx = sr.x, ny = sr.y, nw = sr.w, nh = sr.h;
          if (h === 'nw') { nx = sr.x + dx; ny = sr.y + dy; nw = sr.w - dx; nh = sr.h - dy; }
          if (h === 'ne') { ny = sr.y + dy; nw = sr.w + dx; nh = sr.h - dy; }
          if (h === 'sw') { nx = sr.x + dx; nw = sr.w - dx; nh = sr.h + dy; }
          if (h === 'se') { nw = sr.w + dx; nh = sr.h + dy; }
          const clamped = clampRect(nx, ny, nw, nh);
          updated = { ...sr, ...clamped };
        }

        onRectsChange(entry.rects.map((r) => (r.id === drag.rectId ? updated : r)));
        return;
      }

      if (draft) {
        const { x, y } = getSvgPt(e);
        setDraft((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
      }
    },
    [drag, draft, getSvgPt, entry.rects, onRectsChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (drag) {
        setDrag(null);
        return;
      }
      if (!draft) return;
      const { x, y, svgW, svgH } = getSvgPt(e);
      const wPx = Math.abs(x - draft.startX);
      const hPx = Math.abs(y - draft.startY);
      if (wPx >= 10 && hPx >= 10) {
        const { nx: nx1, ny: ny1 } = toNormPt(draft.startX, draft.startY, svgW, svgH);
        const { nx: nx2, ny: ny2 } = toNormPt(x, y, svgW, svgH);
        const raw = clampRect(
          Math.min(nx1, nx2), Math.min(ny1, ny2),
          Math.abs(nx2 - nx1), Math.abs(ny2 - ny1)
        );
        const newRect: OcclusionRect = { id: generateId(), label: '', ...raw };
        onRectsChange([...entry.rects, newRect]);
        setSelectedId(newRect.id);
      }
      setDraft(null);
    },
    [drag, draft, getSvgPt, toNormPt, entry.rects, onRectsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        onRectsChange(entry.rects.filter((r) => r.id !== selectedId));
        setSelectedId(null);
      }
    },
    [selectedId, entry.rects, onRectsChange]
  );

  const handleLabelChange = useCallback(
    (value: string) => {
      setLabelInput(value);
      onRectsChange(entry.rects.map((r) => (r.id === selectedId ? { ...r, label: value } : r)));
    },
    [selectedId, entry.rects, onRectsChange]
  );

  const draftDisplay = draft
    ? {
        x: Math.min(draft.startX, draft.currentX),
        y: Math.min(draft.startY, draft.currentY),
        w: Math.abs(draft.currentX - draft.startX),
        h: Math.abs(draft.currentY - draft.startY),
      }
    : null;

  return (
    <div
      ref={containerRef}
      className={styles.canvasContainer}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Occlusion drawing canvas"
    >
      <img
        ref={imgRef}
        src={entry.previewUrl}
        alt={entry.file.name}
        className={styles.canvasImage}
        onLoad={() => {
          const img = imgRef.current;
          if (img) setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        }}
        draggable={false}
      />
      <svg
        ref={svgRef}
        className={styles.canvasSvg}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {entry.rects.map((rect, i) => {
          const isSelected = rect.id === selectedId;
          const x = `${rect.x * 100}%`;
          const y = `${rect.y * 100}%`;
          const w = `${rect.w * 100}%`;
          const h = `${rect.h * 100}%`;
          const cx = `${(rect.x + rect.w) * 100}%`;
          const cy = `${(rect.y + rect.h) * 100}%`;
          const mx = `${(rect.x + rect.w / 2) * 100}%`;
          const my = `${(rect.y + rect.h / 2) * 100}%`;
          const hs = HANDLE_SIZE;
          return (
            <g key={rect.id} data-rect={rect.id} style={{ cursor: drag?.rectId === rect.id && drag.type === 'move' ? 'grabbing' : 'grab' }}>
              <rect
                x={x} y={y} width={w} height={h}
                fill={isSelected ? '#ff8e8e' : '#ffeba2'}
                fillOpacity={0.7}
                stroke="#212121"
                strokeWidth={2}
              />
              {rect.label && (
                <text x={x} y={y} dy="1.2em" dx="0.3em" fontSize={12} fill="#212121"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {rect.label}
                </text>
              )}
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle"
                fontSize={11} fontWeight="bold" fill="#212121"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {i + 1}
              </text>
              {isSelected && (
                <>
                  {([['nw', x, y, 'nw-resize'], ['ne', cx, y, 'ne-resize'], ['sw', x, cy, 'sw-resize'], ['se', cx, cy, 'se-resize']] as const).map(([dir, hx, hy, cur]) => (
                    <rect key={dir} data-handle={dir} x={hx} y={hy} width={hs} height={hs}
                      transform={`translate(-${hs / 2}, -${hs / 2})`}
                      fill="#fff" stroke="#212121" strokeWidth={1.5} style={{ cursor: cur }} />
                  ))}
                </>
              )}
            </g>
          );
        })}
        {draftDisplay && (
          <rect
            x={draftDisplay.x} y={draftDisplay.y}
            width={draftDisplay.w} height={draftDisplay.h}
            fill="#ffeba2" fillOpacity={0.5}
            stroke="#212121" strokeWidth={1} strokeDasharray="4 2"
          />
        )}
      </svg>
      {entry.rects.length === 0 && !draft && (
        <div className={styles.canvasEmptyHint}>
          Drag a box over each area to hide.
        </div>
      )}
      {selectedRect && (
        <div className={styles.labelInputWrapper}>
          <input
            type="text"
            value={labelInput}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Label this area (optional)"
            className={styles.labelInput}
            aria-label="Rect label"
          />
          <button
            type="button"
            className={styles.deleteRectBtn}
            onClick={() => {
              onRectsChange(entry.rects.filter((r) => r.id !== selectedId));
              setSelectedId(null);
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
