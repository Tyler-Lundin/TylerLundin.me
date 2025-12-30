"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function CoverImageDropReplace({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `blog-covers/${Date.now()}-${uid()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("public").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("public").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      setDragOver(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center",
          value ? "border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50" : "border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50",
          dragOver ? "ring-2 ring-emerald-400" : "",
        ].join(" ")}
      >
        {value ? (
          <div className="w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Cover" className="aspect-[16/9] w-full rounded-lg object-cover" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <UploadCloud className="h-4 w-4" />
                {uploading ? "Uploading..." : "Replace image"}
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Drag and drop or click to upload</h3>
            <p className="text-xs text-neutral-500">PNG, JPG, or WEBP up to 5MB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? "Uploading..." : "Choose Image"}
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
        />
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-emerald-400/10" />
        )}
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  );
}

