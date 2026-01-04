import { setTimeout as delay } from 'node:timers/promises';
import { config } from './config.js';

type TextSearchResult = {
  results: any[];
  next_page_token?: string;
  status: string;
};

export async function textSearchAll(query: string, maxResults: number): Promise<any[]> {
  const all: any[] = [];
  let pagetoken: string | undefined;
  while (all.length < maxResults) {
    const page = await textSearchPage(query, pagetoken);
    if (page.results?.length) {
      all.push(...page.results);
    }
    if (!page.next_page_token || all.length >= maxResults) break;
    pagetoken = page.next_page_token;
    await delay(2000);
  }
  return all.slice(0, maxResults);
}

async function textSearchPage(query: string, pagetoken?: string): Promise<TextSearchResult> {
  const base = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const params = new URLSearchParams();
  if (pagetoken) {
    params.set('pagetoken', pagetoken);
  } else {
    params.set('query', query);
  }
  params.set('key', config.googleApiKey);
  const url = `${base}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TextSearch failed: ${res.status}`);
  const data = await res.json();
  return data as TextSearchResult;
}

export async function getDetails(placeId: string): Promise<any> {
  const base = 'https://maps.googleapis.com/maps/api/place/details/json';
  const params = new URLSearchParams();
  params.set('place_id', placeId);
  params.set('fields', config.detailsFields);
  params.set('key', config.googleApiKey);
  const url = `${base}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Details failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}

