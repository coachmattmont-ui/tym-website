export const EDIT_DAYS = 30;
export const DEFAULT_PRICE_CENTS = 2900;

const SERVICE_OK = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];

export function paymentsConfigured(env) {
  const src = env || {};
  return SERVICE_OK.every(key => typeof src[key] === 'string' && src[key].trim() !== '');
}

export function authConfigured(env) {
  const src = env || {};
  return !!(src.SUPABASE_URL && String(src.SUPABASE_URL).trim() && src.SUPABASE_ANON_KEY && String(src.SUPABASE_ANON_KEY).trim());
}

export function resolvePriceCents(raw) {
  if (raw == null || String(raw).trim() === '') return { cents: DEFAULT_PRICE_CENTS, source: 'default' };
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 100 || n > 100000) {
    return { error: 'YT_SINGLE_USE_PRICE_CENTS must be whole cents from 100 to 100000. 1500 is $15.00 and 2900 is $29.00.' };
  }
  return { cents: n, source: 'env' };
}

export function nextEditUntil(nowMs, days = EDIT_DAYS) {
  return new Date(nowMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function editWindowOpen(editUntil, nowMs = Date.now()) {
  if (!editUntil) return false;
  const t = Date.parse(editUntil);
  return Number.isFinite(t) && t > nowMs;
}

export function mergeEditUntil(currentIso, grantedIso) {
  if (!currentIso) return grantedIso;
  const current = Date.parse(currentIso);
  const granted = Date.parse(grantedIso);
  if (!Number.isFinite(current)) return grantedIso;
  if (!Number.isFinite(granted)) return currentIso;
  return current > granted ? currentIso : grantedIso;
}

export function cleanProjectName(name) {
  const s = String(name || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  return s.slice(0, 120) || 'Untitled project';
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

function hexEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifyStripeSignature(payload, header, secret, nowSec = Math.floor(Date.now() / 1000), toleranceSec = 300) {
  if (!header || !secret) return { ok: false, reason: 'missing' };
  let timestamp = '';
  const signatures = [];
  String(header).split(',').forEach(part => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const key = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (key === 't') timestamp = val;
    if (key === 'v1' && val) signatures.push(val);
  });
  const ts = Number(timestamp);
  if (!timestamp || !signatures.length || !Number.isFinite(ts)) return { ok: false, reason: 'malformed' };
  if (Math.abs(nowSec - ts) > toleranceSec) return { ok: false, reason: 'stale' };
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const hex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (!signatures.some(sig => hexEqual(sig, hex))) return { ok: false, reason: 'mismatch' };
  return { ok: true, timestamp: ts };
}

export async function signStripePayload(payload, secret, timestampSec) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestampSec}.${payload}`));
  const hex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `t=${timestampSec},v1=${hex}`;
}
