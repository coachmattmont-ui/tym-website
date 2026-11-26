export function createAttemptLimiter({ limit = 8, windowMs = 15 * 60 * 1000 } = {}) {
  const buckets = new Map();
  return function take(key, now = Date.now()) {
    const id = String(key || 'unknown');
    const row = buckets.get(id);
    if (!row || row.reset <= now) {
      buckets.set(id, { count: 1, reset: now + windowMs });
      return { ok: true, remaining: limit - 1 };
    }
    if (row.count >= limit) {
      return { ok: false, retryAfter: Math.max(1, Math.ceil((row.reset - now) / 1000)) };
    }
    row.count += 1;
    return { ok: true, remaining: limit - row.count };
  };
}

export const takeAttempt = createAttemptLimiter();

export function testCodeConfigured(env) {
  return !!(env && typeof env.YT_TEST_ACCESS_CODE === 'string' && env.YT_TEST_ACCESS_CODE.trim());
}

export function supabaseAdminConfigured(env) {
  const src = env || {};
  return !!(String(src.SUPABASE_URL || '').trim() && String(src.SUPABASE_ANON_KEY || '').trim() && String(src.SUPABASE_SERVICE_ROLE_KEY || '').trim());
}

export async function codesMatch(provided, expected) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(String(provided ?? ''))),
    crypto.subtle.digest('SHA-256', enc.encode(String(expected ?? '')))
  ]);
  const a = new Uint8Array(ha);
  const b = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
