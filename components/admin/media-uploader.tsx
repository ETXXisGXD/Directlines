'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Trash2, UploadCloud, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { secondaryButtonClass } from './ui';

interface UploadItem {
  id: string;
  name: string;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  error?: string;
  previewUrl?: string;
  path?: string;
}

const MAX_EDGE = 1800;
const QUALITY = 0.86;

async function loadBitmap(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('unreadable'));
        image.src = url;
      });
      return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error('Could not read this image. Use JPG, PNG or WebP.');
    }
  }
}

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await loadBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image compression is not supported in this browser.');
    context.drawImage(bitmap.source, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));
    if (!blob) throw new Error('Could not compress this image.');
    return blob;
  } finally {
    bitmap.close();
  }
}

export function MediaUploader({
  folder,
  fieldName = 'uploaded_image',
  multiple = true,
  hint,
}: {
  folder: string;
  fieldName?: string;
  multiple?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const done = items.filter((item) => item.status === 'done' && item.path);
  const busy = items.some((item) => item.status === 'compressing' || item.status === 'uploading');

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const chosen = Array.from(files).slice(0, multiple ? 12 : 1);
    const newItems: UploadItem[] = chosen.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      status: 'compressing',
    }));
    setItems((prev) => [...prev, ...newItems]);
    const supabase = createClient();

    for (let index = 0; index < chosen.length; index += 1) {
      const file = chosen[index];
      const item = newItems[index];
      try {
        const compressed = await compressImage(file);
        setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, status: 'uploading' } : entry)));
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const { error } = await supabase.storage.from('site-media').upload(path, compressed, {
          contentType: 'image/webp',
          upsert: false,
          cacheControl: '31536000',
        });
        if (error) throw new Error(error.message);
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: 'done', path, previewUrl: URL.createObjectURL(compressed) }
              : entry
          )
        );
      } catch (error) {
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : entry
          )
        );
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-4">
      {done.map((item) => (
        <input key={`field-${item.id}`} type="hidden" name={fieldName} value={item.path} />
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${secondaryButtonClass} w-full flex-col gap-2 border-dashed py-7`}
      >
        <UploadCloud className="h-5 w-5 text-signal" />
        <span>{multiple ? 'Choose photos' : 'Choose an image'}</span>
        <span className="text-[10px] font-normal normal-case tracking-normal text-muted">
          Compressed to WebP before upload.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {hint ? <p className="text-[11px] leading-relaxed text-muted">{hint}</p> : null}
      {busy ? (
        <p className="rounded-lg bg-[#fff6df] px-3 py-2 text-[11px] text-[#8a6100]">
          Uploading. Wait until each image shows Saved before pressing the save button.
        </p>
      ) : null}

      {items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative rounded-xl border border-line bg-paper p-2">
              {item.previewUrl ? (
                <img src={item.previewUrl} alt={item.name} className="aspect-square w-full rounded-lg object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center rounded-lg bg-paper-deep">
                  {item.status === 'error' ? <AlertCircle className="h-5 w-5 text-signal" /> : <Loader2 className="h-5 w-5 animate-spin text-muted" />}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between gap-1">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em] ${item.status === 'done' ? 'text-emerald-600' : item.status === 'error' ? 'text-signal' : 'text-muted'}`}>
                  {item.status === 'done' ? <CheckCircle2 className="h-3 w-3" /> : null}
                  {item.status === 'done' ? 'Saved' : item.status === 'error' ? 'Failed' : item.status}
                </span>
                <button type="button" onClick={() => setItems((prev) => prev.filter((entry) => entry.id !== item.id))} className="text-muted hover:text-signal" aria-label="Remove upload">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {item.error ? <p className="mt-1 text-[9px] text-signal">{item.error}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
