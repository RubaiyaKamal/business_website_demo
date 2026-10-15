"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { uploadImage } from "@/lib/api-client";
import type { AdminLabels } from "@/lib/admin";

type Props = {
  value: string;
  onChange: (url: string) => void;
  labels: AdminLabels;
  id: string;
};

export function ImageField({ value, onChange, labels, id }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white">
          {value ? (
            <Image src={value} alt="" fill sizes="64px" className="object-cover" unoptimized />
          ) : (
            <span className="grid h-full w-full place-items-center text-ink/30">
              <Icon name="image" size={20} />
            </span>
          )}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={labels.imageUrlPlaceholder}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 whitespace-nowrap rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-60"
          >
            {uploading ? labels.uploading : labels.uploadImage}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          {labels.removeImage}
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
