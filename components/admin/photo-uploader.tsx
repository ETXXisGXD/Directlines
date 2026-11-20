'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Trash2, UploadCloud, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { secondaryButtonClass } from '@/components/admin/ui';

interface UploadItem {
  id: string;
  name: string;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  error?: string;
  previewUrl?: string;
  path?: string;
}

const MAX_EDGE = 1600;
const QUALITY = 0.85;

async function loadBitmap(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    } as ImageBitmapOptions);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('unreadable'));
        image.src = url;
      });
      return {
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error('Could not read this image. Use JPG, PNG or WebP (HEIC files are not supported).');
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
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', QUALITY)
    );
    if (!blob) throw new Error('Could not compress this image.');
    return blob;
  } finally {
    bitmap.close();
  }
}

export function PhotoUploader({
  bucket,
  folder,
  multiple = true,
  fieldName = 'uploaded_image',
  hint,
}: {
  bucket: 'product-images' | 'testimonial-images';
  folder: string;
  multiple?: boolean;
  fieldName?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);
  const [items, setItems] = useState<UploadItem[]>([]);

  const doneItems = items.filter((item) => item.status === 'done' && item.path);
  const busy = items.some((item) => item.status === 'compressing' || item.status === 'uploading');

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    const form = inputRef.current?.closest('form');
    if (!form) return;
    const blocker = (event: Event) => {
      if (busyRef.current) {
        event.preventDefault();
        event.stopPropagation();
        window.alert('Photos are still uploading — wait until each one shows “Saved”, then save.');
      }
    };
    form.addEventListener('submit', blocker, true);
    return () => form.removeEventListener('submit', blocker, true);
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
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
        setItems((prev) =>
          prev.map((entry) => (entry.id === item.id ? { ...entry, status: 'uploading' } : entry))
        );

        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
          contentType: 'image/webp',
          upsert: false,
          cacheControl: '31536000',
        });
        if (error) throw new Error(error.message);

        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: 'done',
                  path,
                  previewUrl: URL.createObjectURL(compressed),
                }
              : entry
          )
        );
      } catch (error) {
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : entry
          )
        );
      }
    }

    if (inputRef.current) inputRef.current.value = '';
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div className="space-y-4" data-upload-count={doneItems.length}>
      {doneItems.map((item) => (
        <input key={`field-${item.id}`} type="hidden" name={fieldName} value={item.path} />
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${secondaryButtonClass} w-full !justify-center border-dashed !py-6 flex-col !gap-2 text-center`}
      >
        <UploadCloud className="w-5 h-5 text-[#d4af37]" />
        <span>{multiple ? 'Choose photos from device' : 'Choose a screenshot from device'}</span>
        <span className="text-[10px] normal-case tracking-normal text-slate-500 font-normal">
          Photos are compressed automatically to fast WebP before upload
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

      {hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}

      {busy ? (
        <p className="text-[11px] text-amber-300">
          Uploading… wait until every photo shows <span className="font-semibold">Saved</span> before
          pressing save.
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl border border-[#242433] bg-[#10101a] p-2.5 space-y-2"
            >
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-full aspect-[3/4] object-cover rounded-lg border border-[#1c1c29]"
                />
              ) : (
                <div className="w-full aspect-[3/4] rounded-lg bg-[#0d0d14] border border-[#1c1c29] flex items-center justify-center">
                  {item.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] ${
                    item.status === 'done'
                      ? 'text-emerald-300'
                      : item.status === 'error'
                      ? 'text-red-300'
                      : 'text-slate-400'
                  }`}
                >
                  {item.status === 'done' ? <CheckCircle2 className="w-3 h-3" /> : null}
                  {item.status === 'done'
                    ? 'Saved'
                    : item.status === 'error'
                    ? 'Failed'
                    : item.status === 'uploading'
                    ? 'Uploading'
                    : 'Compressing'}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {item.status === 'error' && item.error ? (
                <p className="text-[9px] text-red-300 leading-snug">{item.error}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
