import { GripVertical, Lightbulb, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface Props {
  modelId: string;
  title: string;
  lines: string[];
  containerRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
}

interface Point {
  x: number;
  y: number;
}

const STORAGE_PREFIX = 'pybrics-workspace-note-pos-';

function loadPosition(modelId: string): Point | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${modelId}`);
    if (!raw) {
      return null;
    }
    const data = JSON.parse(raw) as Point;
    if (Number.isFinite(data.x) && Number.isFinite(data.y)) {
      return { x: data.x, y: data.y };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function savePosition(modelId: string, point: Point): void {
  localStorage.setItem(`${STORAGE_PREFIX}${modelId}`, JSON.stringify(point));
}

function clampPosition(container: HTMLElement, note: HTMLElement, point: Point): Point {
  const maxX = Math.max(8, container.clientWidth - note.offsetWidth - 8);
  const maxY = Math.max(8, container.clientHeight - note.offsetHeight - 8);
  return {
    x: Math.min(maxX, Math.max(8, point.x)),
    y: Math.min(maxY, Math.max(8, point.y)),
  };
}

export function WorkspaceNote({ modelId, title, lines, containerRef, onDismiss }: Props) {
  const noteRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const [pos, setPos] = useState<Point>(() => loadPosition(modelId) ?? { x: 9999, y: 16 });
  const [dragging, setDragging] = useState(false);

  const placeDefault = useCallback(() => {
    const container = containerRef.current;
    const note = noteRef.current;
    if (!container || !note) {
      return;
    }
    setPos(
      clampPosition(container, note, {
        x: container.clientWidth - note.offsetWidth - 16,
        y: 16,
      }),
    );
  }, [containerRef]);

  useEffect(() => {
    const saved = loadPosition(modelId);
    if (saved) {
      setPos(saved);
      return;
    }
    placeDefault();
  }, [modelId, placeDefault]);

  useEffect(() => {
    const container = containerRef.current;
    const note = noteRef.current;
    if (!container || !note) {
      return;
    }
    const clampCurrent = () => {
      setPos((current) => clampPosition(container, note, current));
    };
    clampCurrent();
    const observer = new ResizeObserver(clampCurrent);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, lines.length]);

  const finishDrag = useCallback(
    (pointerId: number, target: HTMLElement) => {
      if (dragRef.current?.pointerId === pointerId) {
        dragRef.current = null;
        setDragging(false);
        target.releasePointerCapture(pointerId);
        setPos((current) => {
          savePosition(modelId, current);
          return current;
        });
      }
    },
    [modelId],
  );

  const onHeaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHeaderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const container = containerRef.current;
    const note = noteRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !container || !note) {
      return;
    }
    const next = clampPosition(container, note, {
      x: drag.origX + (event.clientX - drag.startX),
      y: drag.origY + (event.clientY - drag.startY),
    });
    setPos(next);
  };

  const onHeaderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event.pointerId, event.currentTarget);
  };

  const onHeaderPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event.pointerId, event.currentTarget);
  };

  return (
    <aside
      ref={noteRef}
      style={{ left: pos.x, top: pos.y }}
      className={`pointer-events-auto absolute z-20 max-w-md rounded-2xl border border-amber-200 bg-amber-50/95 p-4 shadow-lg shadow-amber-900/10 backdrop-blur-sm ${
        dragging ? 'select-none ring-2 ring-amber-400/80' : ''
      }`}
      aria-live="polite"
    >
      <div
        className={`mb-2 flex cursor-grab items-start gap-2 touch-none active:cursor-grabbing ${
          dragging ? 'cursor-grabbing' : ''
        }`}
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onPointerCancel={onHeaderPointerCancel}
      >
        <GripVertical className="mt-0.5 size-5 shrink-0 text-amber-500/80" strokeWidth={2.2} aria-hidden />
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-600" strokeWidth={2.4} aria-hidden />
        <h2 className="flex-1 text-sm font-black leading-snug text-amber-950">{title}</h2>
        <button
          type="button"
          onClick={onDismiss}
          onPointerDown={(event) => event.stopPropagation()}
          className="rounded-lg p-1 text-amber-800/70 transition hover:bg-amber-100 hover:text-amber-950"
          aria-label="Schowaj notatkę"
        >
          <X className="size-4" strokeWidth={2.6} />
        </button>
      </div>
      <ul className="space-y-2 pl-7 text-sm font-semibold leading-relaxed text-amber-950/90">
        {lines.map((line) => (
          <li key={line} className="list-disc">
            {line}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 w-full rounded-xl bg-amber-600 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-amber-700"
      >
        Rozumiem
      </button>
    </aside>
  );
}
