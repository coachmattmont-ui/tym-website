import { createAttemptLimiter } from './access-code.js';

const NAMES = new Set([
  'hero_cta_click',
  'secondary_link_click',
  'instant_quote_completed',
  'layout_checkout_started'
]);

const takeEventAttempt = createAttemptLimiter({ limit: 40, windowMs: 15 * 60 * 1000 });

function clientIp(request) {
  return request.headers.get('cf-connecting-ip')
    || String(request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || 'unknown';
}

export function cleanEvent(body) {
  const src = body && typeof body === 'object' ? body : {};
  const name = NAMES.has(src.name) ? src.name : '';
  const variant = src.variant === 'a' || src.variant === 'b' ? src.variant : '';
  let path = typeof src.path === 'string' ? src.path.slice(0, 180) : '';
  if (!path.startsWith('/') || path.includes('://')) path = '';
  return { name, variant: variant || null, path: path || null };
}

export function cleanHpVariant(value) {
  return value === 'a' || value === 'b' ? value : '';
}

export async function handleEvent(request, env, deps = {}) {
  const limiter = deps.limiter || takeEventAttempt;
  const fetchImpl = deps.fetch || fetch;
  const limit = limiter(clientIp(request), deps.now || Date.now());
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const event = cleanEvent(body);
  if (!event.name) {
    return new Response(JSON.stringify({ error: 'invalid' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
  const url = String((env && env.SUPABASE_URL) || '').replace(/\/$/, '');
  const key = env && env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return new Response(JSON.stringify({ ok: true, stored: false }), {
      status: 202,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
  const res = await fetchImpl(url + '/rest/v1/events', {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: 'Bearer ' + key,
      'content-type': 'application/json',
      prefer: 'return=minimal'
    },
    body: JSON.stringify({ name: event.name, variant: event.variant, path: event.path })
  });
  return new Response(JSON.stringify({ ok: true, stored: !!res.ok }), {
    status: res.ok ? 200 : 202,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
