import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { BookOpen, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PdfPart } from '../models/types.ts';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PAGE_KEY = 'pybricks-junior-pdf-pages';
const WIDTH_KEY = 'pybricks-junior-pdf-width';
const pdfCache = new Map<string, Uint8Array>();

interface Props {
  parts: PdfPart[];
  onClose: () => void;
}

export function InstructionsPanel({ parts, onClose }: Props) {
  const [partId, setPartId] = useState(parts[0]?.id ?? '');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const [width, setWidth] = useState(() => readWidth());
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderGen = useRef(0);

  const part = parts.find((item) => item.id === partId) ?? parts[0];

  useEffect(() => {
    if (!part) {
      return;
    }
    const ac = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError('');
    setProgress(pdfCache.has(part.url) ? 1 : 0);
    pdfRef.current = null;

    void (async () => {
      try {
        const data = await loadPdfBytes(part.url, (ratio) => {
          if (!cancelled) {
            setProgress(ratio);
          }
        }, ac.signal);
        const pdf = await pdfjsLib.getDocument({ data: data.slice() }).promise;
        if (cancelled) {
          return;
        }
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
        setPage(readSavedPage(part.url, pdf.numPages));
        setLoading(false);
      } catch (err) {
        if (cancelled || ac.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [part]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!pdf || !canvas || !frame || loading || error) {
      return;
    }
    const gen = ++renderGen.current;
    const pageNum = Math.min(Math.max(1, page), pdf.numPages);
    void (async () => {
      const pdfPage = await pdf.getPage(pageNum);
      if (gen !== renderGen.current) {
        return;
      }
      const unscaled = pdfPage.getViewport({ scale: 1 });
      const available = Math.max(120, frame.clientWidth - 24);
      const scale = (available / unscaled.width) * zoom;
      const viewport = pdfPage.getViewport({ scale });
      const output = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * output);
      canvas.height = Math.floor(viewport.height * output);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const task = pdfPage.render({
        canvasContext: ctx,
        canvas,
        viewport,
        transform: output === 1 ? undefined : [output, 0, 0, output, 0, 0],
      });
      await task.promise;
    })();
  }, [page, zoom, width, full, loading, error, partId]);

  useEffect(() => {
    if (!part || pageCount === 0) {
      return;
    }
    savePage(part.url, page);
  }, [part, page, pageCount]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        setPage((n) => Math.max(1, n - 1));
      } else if (event.key === 'ArrowRight') {
        setPage((n) => Math.min(pageCount || n, n + 1));
      } else if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageCount, onClose]);

  const startResize = (event: React.MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = full ? window.innerWidth : width;
    const onMove = (move: MouseEvent) => {
      setFull(false);
      const next = Math.min(Math.max(320, startWidth + (startX - move.clientX)), Math.floor(window.innerWidth * 0.9));
      setWidth(next);
      localStorage.setItem(WIDTH_KEY, String(next));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!part) {
    return null;
  }

  return (
    <aside
      className="relative z-10 flex h-full shrink-0 flex-col border-l border-slate-200 bg-white shadow-[-12px_0_32px_-16px_rgb(15_23_42/0.25)]"
      style={{ width: full ? '100%' : width }}
    >
      <button
        type="button"
        aria-label="Zmień szerokość"
        onMouseDown={startResize}
        className="absolute top-0 bottom-0 -left-1 z-10 w-3 cursor-col-resize"
      />
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <BookOpen className="size-5 text-sky-600" strokeWidth={2.4} />
        <div className="min-w-0 flex-1 truncate text-sm font-black text-slate-700">Instrukcja</div>
        <IconBtn label={full ? 'Mniejszy panel' : 'Pełny ekran'} onClick={() => setFull((v) => !v)}>
          {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </IconBtn>
        <IconBtn label="Zamknij instrukcję" onClick={onClose}>
          <X className="size-4" />
        </IconBtn>
      </div>

      {parts.length > 1 && (
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-2">
          {parts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPartId(item.id)}
              className={`h-9 shrink-0 rounded-full px-3 text-sm font-extrabold transition ${
                item.id === part.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div ref={frameRef} className="relative min-h-0 flex-1 overflow-auto bg-slate-100">
        {loading && (
          <div className="absolute inset-0 grid place-items-center p-6">
            <div className="w-full max-w-xs text-center">
              <div className="text-sm font-extrabold text-slate-600">Pobieram instrukcję…</div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-sky-500 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="mt-2 text-xs font-bold text-slate-400">{Math.round(progress * 100)}%</div>
              <p className="mt-3 text-xs font-semibold text-slate-400">Plik jest duży. Później otworzy się od razu.</p>
            </div>
          </div>
        )}
        {error && (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <p className="font-extrabold text-slate-700">Nie udało się wczytać instrukcji.</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Sprawdź internet albo otwórz PDF w nowej karcie.</p>
              <a
                href={part.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-11 items-center rounded-2xl bg-sky-500 px-5 font-extrabold text-white"
              >
                Otwórz PDF w nowej karcie
              </a>
            </div>
          </div>
        )}
        <div className={`flex justify-center p-3 ${loading || error ? 'hidden' : ''}`}>
          <canvas ref={canvasRef} className="max-w-full rounded-lg bg-white shadow" />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
        <IconBtn label="Poprzednia strona" onClick={() => setPage((n) => Math.max(1, n - 1))} disabled={page <= 1}>
          <ChevronLeft className="size-5" />
        </IconBtn>
        <div className="min-w-20 text-center text-sm font-black text-slate-600">
          {pageCount > 0 ? `Strona ${page} z ${pageCount}` : '—'}
        </div>
        <IconBtn
          label="Następna strona"
          onClick={() => setPage((n) => Math.min(pageCount, n + 1))}
          disabled={page >= pageCount}
        >
          <ChevronRight className="size-5" />
        </IconBtn>
        <div className="flex-1" />
        <IconBtn label="Pomniejsz" onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}>
          <Minus className="size-4" />
        </IconBtn>
        <span className="w-10 text-center text-xs font-black text-slate-400">{Math.round(zoom * 100)}%</span>
        <IconBtn label="Powiększ" onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))}>
          <Plus className="size-4" />
        </IconBtn>
      </div>
    </aside>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function readWidth(): number {
  const raw = Number(localStorage.getItem(WIDTH_KEY));
  if (Number.isFinite(raw) && raw >= 320) {
    return raw;
  }
  return Math.round(window.innerWidth * 0.45);
}

function readSavedPage(url: string, max: number): number {
  try {
    const stored = JSON.parse(localStorage.getItem(PAGE_KEY) ?? '{}') as Record<string, number>;
    const value = Number(stored[url]);
    if (Number.isFinite(value)) {
      return Math.min(max, Math.max(1, Math.round(value)));
    }
  } catch {
    /* ignore */
  }
  return 1;
}

function savePage(url: string, page: number): void {
  try {
    const stored = JSON.parse(localStorage.getItem(PAGE_KEY) ?? '{}') as Record<string, number>;
    stored[url] = page;
    localStorage.setItem(PAGE_KEY, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
}

async function loadPdfBytes(
  url: string,
  onProgress: (ratio: number) => void,
  signal: AbortSignal,
): Promise<Uint8Array> {
  const cached = pdfCache.get(url);
  if (cached) {
    onProgress(1);
    return cached;
  }
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const total = Number(response.headers.get('content-length')) || 0;
  if (!response.body) {
    const data = new Uint8Array(await response.arrayBuffer());
    pdfCache.set(url, data);
    onProgress(1);
    return data;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    received += value.byteLength;
    if (total > 0) {
      onProgress(received / total);
    }
  }
  const data = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  pdfCache.set(url, data);
  onProgress(1);
  return data;
}
