import { codesMatch, createAttemptLimiter, supabaseAdminConfigured, takeAttempt, testCodeConfigured } from '../_lib/access-code.js';
import { cleanProjectName } from '../_lib/billing.js';
import { nextEditUntil } from '../_lib/billing.js';
import { cleanSeed, grantTestProject } from '../_lib/grant.js';
import { json } from '../_lib/http.js';
import { dbFromEnv, getUser } from '../_lib/supabase.js';

function clientIp(request) {
  return request.headers.get('cf-connecting-ip')
    || String(request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || 'unknown';
}

export async function handleTestAccess(request, env, deps = {}) {
  const now = deps.now || Date.now();
  const limiter = deps.limiter || takeAttempt;
  const fetchImpl = deps.fetch || fetch;
  const limit = limiter(clientIp(request), now);
  if (!limit.ok) {
    return json(429, {
      error: 'rate_limited',
      message: 'Too many tries. Wait a few minutes and try again.'
    });
  }
  if (!testCodeConfigured(env)) {
    return json(404, { error: 'codes_disabled', message: 'Access codes are not enabled.' });
  }
  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const raw = typeof body.code === 'string' ? body.code : '';
  const provided = raw.length > 200 ? '' : raw.trim();
  const match = await codesMatch(provided, String(env.YT_TEST_ACCESS_CODE).trim());
  if (!raw.trim() || raw.length > 200 || !match) {
    return json(401, { error: 'invalid_code', message: 'That code does not match.' });
  }

  const seed = cleanSeed(body.seed);
  const name = cleanProjectName(body.name);
  if (!supabaseAdminConfigured(env)) {
    return json(200, {
      mode: 'local',
      testMode: true,
      source: 'test_code',
      editUntil: nextEditUntil(now)
    });
  }

  const user = await getUser(env, request, fetchImpl);
  if (!user) {
    return json(401, { error: 'unauthorized', message: 'Sign in, then enter the code again.' });
  }
  const granted = await grantTestProject(dbFromEnv(env, fetchImpl), {
    userId: user.id,
    name,
    seed,
    nowMs: now
  });
  if (!granted.ok) return json(granted.status || 500, { error: granted.reason, message: 'The test project could not be opened.' });
  return json(200, {
    mode: 'account',
    testMode: false,
    source: 'test_code',
    projectId: granted.projectId,
    editUntil: granted.editUntil
  });
}

export function onRequestPost(context) {
  return handleTestAccess(context.request, context.env || {});
}
