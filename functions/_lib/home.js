const DAY = 24 * 60 * 60;
const COOKIE_AGE = 90 * DAY;

export function resolveVariant(request, random = Math.random) {
  const url = new URL(request.url);
  const query = url.searchParams.get('hp');
  if (query === 'a' || query === 'b') return { variant: query, setCookie: true };
  const header = request.headers.get('cookie') || '';
  const match = header.match(/(?:^|;\s*)tym_hp=(a|b)(?:\s*;|$)/);
  if (match) return { variant: match[1], setCookie: false };
  const roll = Number(random());
  return { variant: roll < 0.5 ? 'a' : 'b', setCookie: true };
}

function cookieHeader(variant, secure) {
  const flag = secure ? '; Secure' : '';
  return 'tym_hp=' + variant + '; Path=/; Max-Age=' + COOKIE_AGE + '; SameSite=Lax' + flag;
}

async function readAsset(request, env, variant) {
  if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
    throw new Error('assets unavailable');
  }
  const url = new URL(request.url);
  const path = variant === 'a' ? '/home-a.html' : '/index.html';
  const assetUrl = new URL(path, url.origin);
  const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET' }));
  if (!res || !res.ok) throw new Error('asset missing');
  return res;
}

function htmlResponse(asset, request, choice) {
  const headers = new Headers(asset.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'private, no-store');
  headers.set('vary', 'Cookie');
  if (choice.setCookie) {
    const secure = new URL(request.url).protocol === 'https:';
    headers.set('set-cookie', cookieHeader(choice.variant, secure));
  }
  return new Response(asset.body, { status: 200, headers });
}

export async function handleHome(request, env, deps = {}) {
  const resolve = deps.resolve || resolveVariant;
  let choice = { variant: 'b', setCookie: true };
  try {
    choice = resolve(request);
    if (choice.variant !== 'a' && choice.variant !== 'b') choice = { variant: 'b', setCookie: true };
  } catch (e) {
    choice = { variant: 'b', setCookie: true };
  }
  try {
    const asset = await readAsset(request, env, choice.variant);
    return htmlResponse(asset, request, choice);
  } catch (e) {
    try {
      const asset = await readAsset(request, env, 'b');
      return htmlResponse(asset, request, { variant: 'b', setCookie: true });
    } catch (err) {
      return new Response('Homepage is unavailable.', {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'private, no-store' }
      });
    }
  }
}
