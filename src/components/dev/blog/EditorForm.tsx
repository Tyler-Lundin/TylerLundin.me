"use client";

import { useMemo, useState, useTransition } from "react";
import { savePostAction } from "@/app/dev/actions/blog";
import CoverImageDropReplace from "./CoverImageDropReplace";

export type EditablePost = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content_md?: string | null;
  cover_image_url?: string | null;
  tags?: string[];
  reading_time_minutes?: number | null;
};

export default function EditorForm({ initial }: { initial: EditablePost }) {
  const [post, setPost] = useState<EditablePost>({
    id: initial.id,
    title: initial.title ?? "",
    slug: initial.slug ?? "",
    excerpt: initial.excerpt ?? "",
    content_md: initial.content_md ?? "",
    cover_image_url: initial.cover_image_url ?? "",
    tags: initial.tags ?? [],
    reading_time_minutes: initial.reading_time_minutes ?? undefined,
  });
  const [isPending, startTransition] = useTransition();

  const tagString = useMemo(() => (post.tags || []).join(", "), [post.tags]);

  const calcReadingTime = (md?: string | null) => {
    const text = (md || "").replace(/`{1,3}[\s\S]*?`{1,3}/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  };

  const updateField = (key: keyof EditablePost, value: any) =>
    setPost((p) => ({ ...p, [key]: value }));

  const doSave = (status: "draft" | "published") => {
    const payload = {
      id: post.id,
      title: post.title?.trim(),
      slug: post.slug?.trim() || undefined,
      excerpt: (post.excerpt || "").toString().trim() || null,
      content_md: post.content_md || "",
      cover_image_url: (post.cover_image_url || "").trim() || null,
      tags: (post.tags || []).map((t) => t.trim()).filter(Boolean),
      reading_time_minutes: calcReadingTime(post.content_md),
    };
    startTransition(async () => {
      await savePostAction(status, JSON.stringify(payload));
    });
  };

  return (
    <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium opacity-70">Edit Post</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => doSave("draft")}
            disabled={isPending}
            className="inline-flex items-center rounded-md border border-black/10 dark:border-white/10 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => doSave("published")}
            disabled={isPending}
            className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <div>
            <label className="text-xs font-medium opacity-70">Title</label>
            <input
              value={post.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Post title"
              className="mt-1 w-full rounded-md border border-black/10 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200 dark:border-white/10 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium opacity-70">Slug (optional)</label>
            <input
              value={post.slug || ""}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="my-post-slug"
              className="mt-1 w-full rounded-md border border-black/10 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200 dark:border-white/10 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium opacity-70">Excerpt</label>
            <textarea
              value={post.excerpt || ""}
              onChange={(e) => updateField("excerpt", e.target.value)}
              rows={3}
              placeholder="Short summary for listings and social."
              className="mt-1 w-full rounded-md border border-black/10 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200 dark:border-white/10 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium opacity-70">Content (Markdown)</label>
            <textarea
              value={post.content_md || ""}
              onChange={(e) => updateField("content_md", e.target.value)}
              rows={18}
              placeholder="# Heading\n\nWrite your post in Markdown..."
              className="mt-1 w-full rounded-md border border-black/10 bg-white p-2 font-mono text-sm outline-none focus:ring-2 focus:ring-neutral-200 dark:border-white/10 dark:bg-neutral-900"
            />
            <div className="mt-1 text-xs opacity-60">Estimated reading time: {calcReadingTime(post.content_md)} min</div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-3">
          <div>
            <label className="text-xs font-medium opacity-70">Cover Image</label>
            <div className="mt-1">
              <CoverImageDropReplace
                value={post.cover_image_url || null}
                onChange={(url) => updateField("cover_image_url", url)}
              />
            </div>
            <div className="mt-2">
              <label className="text-[11px] opacity-60">Or paste URL</label>
              <input
                value={post.cover_image_url || ""}
                onChange={(e) => updateField("cover_image_url", e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-md border border-black/10 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200 dark:border-white/10 dark:bg-neutral-900"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium opacity-70">Tags (comma separated)</label>
            <input
              value={tagString}
              onChange={(e) => updateField("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="react, performance, ui"
              className="mt-1 w-full rounded-md border border-black/10 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200 dark:border-white/10 dark:bg-neutral-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
