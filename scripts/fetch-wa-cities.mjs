#!/usr/bin/env node
/*
  Fetches all incorporated places in Washington (cities + towns) from Wikipedia categories
  and writes a typed config to src/config/locations/wa.ts

  Categories used:
  - Cities in Washington (state)
  - Towns in Washington (state)
*/

import fs from 'node:fs/promises'
import path from 'node:path'

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function fetchCategoryMembers(title) {
  // Use namespace 0 (article pages) and limit to pages
  const url = `${WIKI_API}?action=query&format=json&list=categorymembers&cmtitle=${encodeURIComponent(title)}&cmnamespace=0&cmtype=page&cmlimit=500`;
  const res = await fetch(url, { headers: { 'User-Agent': 'tylerlundin.me/locations (script)' } });
  if (!res.ok) throw new Error(`Failed to fetch ${title}: ${res.status}`);
  const json = await res.json();
  /** @type {{query?: {categorymembers?: {title: string}[]}}} */
  const data = json;
  return (data.query?.categorymembers ?? []).map((m) => m.title);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // drop parentheticals
    .replace(/,.*$/, '') // drop trailing ", Washington" where present
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const cities = await fetchCategoryMembers('Category:Cities in Washington (state)');
  const towns = await fetchCategoryMembers('Category:Towns in Washington (state)');
  const titles = Array.from(new Set([...cities, ...towns])).filter((t) => !/\b(former|disincorporated)\b/i.test(t));

  // Batch fetch thumbnails for titles
  const BATCH = 40;
  const thumbByTitle = new Map();
  for (let i = 0; i < titles.length; i += BATCH) {
    const batch = titles.slice(i, i + BATCH);
    const url = `${WIKI_API}?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=160&titles=${encodeURIComponent(batch.join('|'))}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'tylerlundin.me/locations (script)' } });
    if (!res.ok) throw new Error(`Failed to fetch thumbnails: ${res.status}`);
    const json = await res.json();
    const pages = json?.query?.pages ?? {};
    for (const key of Object.keys(pages)) {
      const p = pages[key];
      if (p?.title) {
        const src = p?.thumbnail?.source;
        if (src) thumbByTitle.set(p.title, src);
      }
    }
  }

  const all = titles
    .map((originalTitle) => {
      const display = originalTitle.replace(/, Washington.*$/, '');
      return {
        name: display,
        slug: slugify(display),
        icon: thumbByTitle.get(originalTitle) || undefined,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const outPath = path.resolve('src/config/locations/wa.ts');
  const header = `export type City = {\n  name: string;\n  slug: string;\n  icon?: string; // optional URL/path to an icon\n};\n\n`;
  const body = `export const waCities: City[] = ${JSON.stringify(all, null, 2)};\n\nexport default waCities;\n`;

  await fs.writeFile(outPath, header + body, 'utf8');
  console.log(`Wrote ${all.length} WA cities/towns to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
