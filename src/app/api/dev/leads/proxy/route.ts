import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';

function isAllowedUrl(u: URL) {
  if (!/^https?:$/.test(u.protocol)) return false;
  const host = u.hostname;
  const blocked = ['localhost', '127.0.0.1', '::1'];
  if (blocked.includes(host)) return false;
  if (/^(10\.|192\.168\.|127\.|169\.254\.)/.test(host)) return false;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return false;
  return true;
}

function computeBaseHref(u: URL) {
  const path = u.pathname;
  if (path.endsWith('/')) return `${u.origin}${path}`;
  const idx = path.lastIndexOf('/');
  const dir = idx >= 0 ? path.slice(0, idx + 1) : '/';
  return `${u.origin}${dir}`;
}

export async function GET(req: NextRequest) {
  try {
    try {
      await requireRoles(['admin', 'owner']);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const ua = (searchParams.get('ua') || 'desktop').toLowerCase();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    let target: URL;
    try { target = new URL(url); } catch { return NextResponse.json({ error: 'Invalid url' }, { status: 400 }); }
    if (!isAllowedUrl(target)) return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });

    const userAgentDesktop = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LeadSwipe/1.0';
    const userAgentMobile = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    const chosenUA = ua === 'mobile' ? userAgentMobile : userAgentDesktop;

    async function makeFetch(agent: string, withRef: boolean) {
      const headers: Record<string, string> = {
        'user-agent': agent,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'upgrade-insecure-requests': '1',
      };
      if (withRef) headers['referer'] = target.origin;
      return fetch(target.toString(), { headers, redirect: 'follow', cache: 'no-store' });
    }

    // Try with chosen UA and referer; if blocked, try alternate UA without referer
    let res = await makeFetch(chosenUA, true);
    if (res.status === 403 || res.status === 406) {
      const altUA = chosenUA === userAgentDesktop ? userAgentMobile : userAgentDesktop;
      res = await makeFetch(altUA, false);
    }

    const contentType = res.headers.get('content-type') || '';
    const status = res.status;

    if (!contentType.includes('text/html')) {
      const buf = await res.arrayBuffer();
      const out = new NextResponse(buf, { status });
      out.headers.set('content-type', contentType);
      return out;
    }

    let html = await res.text();
    html = html.replace(/<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');

    const baseHref = computeBaseHref(target);
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => `${m}\n<base href="${baseHref}">` + (ua === 'mobile' ? `\n<meta name="viewport" content="width=device-width, initial-scale=1">` : ''));
    } else {
      html = `<head><base href="${baseHref}">${ua === 'mobile' ? '<meta name="viewport" content="width=device-width, initial-scale=1">' : ''}</head>` + html;
    }

    // Basic rewrite: route links and assets through this proxy so subsequent requests use same headers
    function shouldRewrite(href: string) {
      if (!href) return false;
      const lower = href.trim().toLowerCase();
      if (lower.startsWith('javascript:') || lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('#') || lower.startsWith('data:')) return false;
      return true;
    }
    function absolutize(u: string) {
      try { return new URL(u, baseHref).toString(); } catch { return u; }
    }
    html = html.replace(/\s(href|src)=["']([^"']+)["']/gi, (_m: string, attr: string, val: string) => {
      if (!shouldRewrite(val)) return ` ${attr}="${val}"`;
      const abs = absolutize(val);
      const prox = `/api/dev/leads/proxy?ua=${ua}&url=${encodeURIComponent(abs)}`;
      return ` ${attr}="${prox}"`;
    });
    // Rewrite srcset entries
    html = html.replace(/\s(srcset)=["']([^"']+)["']/gi, (_m: string, attr: string, val: string) => {
      const parts = val.split(',').map((p: string) => p.trim());
      const mapped = parts.map((p: string) => {
        const m = p.match(/^(\S+)(\s+.*)?$/);
        if (!m) return p;
        const url = m[1];
        const rest = m[2] || '';
        if (!shouldRewrite(url)) return p;
        const abs = absolutize(url);
        const prox = `/api/dev/leads/proxy?ua=${ua}&url=${encodeURIComponent(abs)}`;
        return `${prox}${rest}`;
      });
      return ` ${attr}="${mapped.join(', ')}"`;
    });

    const out = new NextResponse(html, { status });
    out.headers.set('content-type', 'text/html; charset=utf-8');
    return out;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Proxy failed' }, { status: 500 });
  }
}
