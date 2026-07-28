'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { UploadCloud, FileText, X, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────

export interface UploadedFileResult {
  fileName: string;
  size: number;
  url: string;
}

interface FileUploadProps {
  /** Upload endpoint the file is POSTed to (multipart/form-data, field name "file") */
  uploadUrl: string;
  /** Extra form fields sent alongside the file, e.g. `{ type: 'thumbnail' }` */
  extraFields?: Record<string, string>;
  /** Accepted MIME types or extensions, e.g. `['image/png','image/jpeg']` or `['.pdf']` */
  accept?: string[];
  /** Max file size in bytes. Defaults to 100MB. */
  maxSizeBytes?: number;
  /** Allow selecting/dropping more than one file at once. Defaults to true. */
  multiple?: boolean;
  /** Called after a file finishes uploading successfully */
  onUploadComplete?: (file: UploadedFileResult) => void;
  /** Called if a file fails validation or upload */
  onUploadError?: (fileName: string, error: string) => void;
  label?: string;
  hint?: string;
  className?: string;
}

type ItemStatus = 'uploading' | 'success' | 'error';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string | null;
  status: ItemStatus;
  progress: number;
  errorMessage?: string;
  resultUrl?: string;
}

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100MB

// ── Helpers ───────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function matchesAccept(file: File, accept?: string[]): boolean {
  if (!accept || accept.length === 0) return true;
  return accept.some((pattern) => {
    if (pattern.startsWith('.')) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    }
    if (pattern.endsWith('/*')) {
      return file.type.startsWith(pattern.slice(0, -1));
    }
    return file.type === pattern;
  });
}

function describeAccept(accept?: string[]): string {
  if (!accept || accept.length === 0) return 'Any file type';
  return accept.map((a) => a.replace('.', '').replace('/*', '')).join(', ').toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────────

export function FileUpload({
  uploadUrl,
  extraFields,
  accept,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  multiple = true,
  onUploadComplete,
  onUploadError,
  label = 'Upload files',
  hint,
  className,
}: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRefs = useRef<Record<string, XMLHttpRequest>>({});
  const inputId = useId();

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  const startUpload = useCallback((item: UploadItem) => {
    const xhr = new XMLHttpRequest();
    xhrRefs.current[item.id] = xhr;

    const form = new FormData();
    form.append('file', item.file);
    Object.entries(extraFields ?? {}).forEach(([key, value]) => form.append(key, value));

    xhr.open('POST', uploadUrl);

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hamplard_token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        updateItem(item.id, { progress: Math.round((e.loaded / e.total) * 100) });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let url = '';
        try {
          const parsed = JSON.parse(xhr.responseText);
          url = parsed?.data?.url ?? parsed?.url ?? '';
        } catch {
          // Non-JSON response — leave url empty
        }
        updateItem(item.id, { status: 'success', progress: 100, resultUrl: url });
        onUploadComplete?.({ fileName: item.file.name, size: item.file.size, url });
      } else {
        const message = `Upload failed (${xhr.status})`;
        updateItem(item.id, { status: 'error', errorMessage: message });
        onUploadError?.(item.file.name, message);
      }
    };

    xhr.onerror = () => {
      const message = 'Network error — please try again.';
      updateItem(item.id, { status: 'error', errorMessage: message });
      onUploadError?.(item.file.name, message);
    };

    xhr.send(form);
  }, [uploadUrl, extraFields, onUploadComplete, onUploadError]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const files = multiple ? Array.from(fileList) : Array.from(fileList).slice(0, 1);

    const newItems: UploadItem[] = files.map((file) => {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

      if (!matchesAccept(file, accept)) {
        const message = `"${file.name}" isn't an accepted file type (${describeAccept(accept)}).`;
        onUploadError?.(file.name, message);
        return { id, file, previewUrl, status: 'error', progress: 0, errorMessage: message };
      }
      if (file.size > maxSizeBytes) {
        const message = `"${file.name}" is too large. Max size is ${formatBytes(maxSizeBytes)}.`;
        onUploadError?.(file.name, message);
        return { id, file, previewUrl, status: 'error', progress: 0, errorMessage: message };
      }
      return { id, file, previewUrl, status: 'uploading', progress: 0 };
    });

    setItems((prev) => (multiple ? [...prev, ...newItems] : newItems));

    newItems.filter((it) => it.status === 'uploading').forEach((it) => startUpload(it));
  }, [multiple, accept, maxSizeBytes, onUploadError, startUpload]);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function handleRetry(item: UploadItem) {
    updateItem(item.id, { status: 'uploading', progress: 0, errorMessage: undefined });
    startUpload({ ...item, status: 'uploading', progress: 0 });
  }

  function handleRemove(item: UploadItem) {
    xhrRefs.current[item.id]?.abort();
    delete xhrRefs.current[item.id];
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setItems((prev) => prev.filter((it) => it.id !== item.id));
  }

  return (
    <div className={cn('w-full', className)}>
      {/* ── Drop zone ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-hamplard-primary focus-visible:ring-offset-2',
          dragActive
            ? 'border-hamplard-primary bg-hamplard-lilac'
            : 'border-ink-200 bg-ink-50 hover:border-hamplard-primary/60 hover:bg-hamplard-lilac/40',
        )}
      >
        <UploadCloud className={cn('w-8 h-8', dragActive ? 'text-hamplard-primary' : 'text-ink-400')} aria-hidden="true" />
        <p className="text-sm font-medium text-ink-700">
          <span className="text-hamplard-primary font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-ink-400">
          {hint ?? `${describeAccept(accept)} · up to ${formatBytes(maxSizeBytes)}`}
        </p>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple={multiple}
          accept={accept?.join(',')}
          onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
          className="sr-only"
        />
      </div>

      {/* ── File list ── */}
      {items.length > 0 && (
        <ul className="mt-4 space-y-3" aria-label="Uploads">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3"
            >
              {/* Thumbnail / file icon */}
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt=""
                  className="w-11 h-11 rounded-lg object-cover shrink-0 border border-ink-100"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-ink-50 flex items-center justify-center shrink-0 border border-ink-100">
                  <FileText className="w-5 h-5 text-ink-400" aria-hidden="true" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink-900 truncate">{item.file.name}</p>
                  {item.status === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-leaf-500 shrink-0" aria-label="Upload complete" />
                  )}
                </div>
                <p className="text-xs text-ink-400">{formatBytes(item.file.size)}</p>

                {/* Progress bar */}
                {item.status === 'uploading' && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${item.progress}%`, backgroundColor: '#7F77DD' }}
                    />
                  </div>
                )}

                {/* Error message */}
                {item.status === 'error' && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.errorMessage}</span>
                    <button
                      type="button"
                      onClick={() => handleRetry(item)}
                      className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" aria-hidden="true" />
                      Retry
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item.file.name}`}
                className="text-ink-300 hover:text-ink-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}