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

const MIN_SIZE_PX = 10;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toNormalized(px: number, dimension: number): number {
  return Math.max(0, Math.min(1, px / dimension));
}

function clampRect(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  imgW: number,
  imgH: number
): { x: number; y: number; w: number; h: number } {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const w = Math.abs(endX - startX);
  const h = Math.abs(endY - startY);
  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    w: Math.min(w, imgW - x),
    h: Math.min(h, imgH - y),
  };
}

export function OcclusionCanvas({ entry, onRectsChange }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftRect | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setSelectedId(null);
    setDraft(null);
  }, [entry.file]);

  const selectedRect = entry.rects.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    setLabelInput(selectedRect?.label ?? '');
  }, [selectedRect]);

  const getSvgCoords = useCallback(
    (e: PointerEvent | React.PointerEvent): { x: number; y: number } => {
      const svg = containerRef.current?.querySelector('svg');
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const svgToNatural = useCallback(
    (svgX: number, svgY: number): { x: number; y: number } => {
      const svg = containerRef.current?.querySelector('svg');
      const img = imgRef.current;
      if (!svg || !img || imgNaturalSize.w === 0) return { x: 0, y: 0 };
      const svgRect = svg.getBoundingClientRect();
      const scaleX = imgNaturalSize.w / svgRect.width;
      const scaleY = imgNaturalSize.h / svgRect.height;
      return {
        x: svgX * scaleX,
        y: svgY * scaleY,
      };
    },
    [imgNaturalSize]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if ((e.target as Element).closest('[data-rect]')) return;
      const coords = getSvgCoords(e);
      setDraft({ startX: coords.x, startY: coords.y, currentX: coords.x, currentY: coords.y });
      setSelectedId(null);
      try {
        (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
      } catch {
        // jsdom does not implement setPointerCapture
      }
    },
    [getSvgCoords]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draft) return;
      const coords = getSvgCoords(e);
      setDraft((prev) => (prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null));
    },
    [draft, getSvgCoords]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draft) return;
      const coords = getSvgCoords(e);
      const svg = containerRef.current?.querySelector('svg');
      if (svg) {
        const svgRect = svg.getBoundingClientRect();
        const wPx = Math.abs(coords.x - draft.startX);
        const hPx = Math.abs(coords.y - draft.startY);
        if (wPx >= MIN_SIZE_PX && hPx >= MIN_SIZE_PX) {
          const nat1 = svgToNatural(draft.startX, draft.startY);
          const nat2 = svgToNatural(coords.x, coords.y);
          const clamped = clampRect(
            nat1.x, nat1.y, nat2.x, nat2.y,
            imgNaturalSize.w, imgNaturalSize.h
          );
          const newRect: OcclusionRect = {
            id: generateId(),
            x: toNormalized(clamped.x, imgNaturalSize.w),
            y: toNormalized(clamped.y, imgNaturalSize.h),
            w: toNormalized(clamped.w, imgNaturalSize.w),
            h: toNormalized(clamped.h, imgNaturalSize.h),
            label: '',
          };
          onRectsChange([...entry.rects, newRect]);
          setSelectedId(newRect.id);
        }
        svgRect;
      }
      setDraft(null);
    },
    [draft, getSvgCoords, svgToNatural, imgNaturalSize, entry.rects, onRectsChange]
  );

  const handleRectClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedId(id);
    },
    []
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
      onRectsChange(
        entry.rects.map((r) => (r.id === selectedId ? { ...r, label: value } : r))
      );
    },
    [selectedId, entry.rects, onRectsChange]
  );

  const handleImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (img) {
      setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  const draftDisplay = draft
    ? (() => {
        const x = Math.min(draft.startX, draft.currentX);
        const y = Math.min(draft.startY, draft.currentY);
        const w = Math.abs(draft.currentX - draft.startX);
        const h = Math.abs(draft.currentY - draft.startY);
        return { x, y, w, h };
      })()
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
        onLoad={handleImgLoad}
        draggable={false}
      />
      <svg
        className={styles.canvasSvg}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {entry.rects.map((rect, i) => {
          const isSelected = rect.id === selectedId;
          return (
            <g
              key={rect.id}
              data-rect={rect.id}
              onClick={(e) => handleRectClick(e, rect.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={`${rect.x * 100}%`}
                y={`${rect.y * 100}%`}
                width={`${rect.w * 100}%`}
                height={`${rect.h * 100}%`}
                fill={isSelected ? '#ff8e8e' : '#ffeba2'}
                fillOpacity={0.7}
                stroke="#212121"
                strokeWidth={2}
              />
              {rect.label && (
                <text
                  x={`${rect.x * 100}%`}
                  y={`${rect.y * 100}%`}
                  dy="1.2em"
                  dx="0.3em"
                  fontSize={12}
                  fill="#212121"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {rect.label}
                </text>
              )}
              <text
                x={`${(rect.x + rect.w / 2) * 100}%`}
                y={`${(rect.y + rect.h / 2) * 100}%`}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight="bold"
                fill="#212121"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
        {draftDisplay && (
          <rect
            x={draftDisplay.x}
            y={draftDisplay.y}
            width={draftDisplay.w}
            height={draftDisplay.h}
            fill="#ffeba2"
            fillOpacity={0.5}
            stroke="#212121"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        )}
      </svg>
      {selectedRect && (
        <div className={styles.labelInputWrapper}>
          <input
            type="text"
            value={labelInput}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Label (optional)"
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
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
